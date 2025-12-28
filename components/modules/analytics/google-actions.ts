'use server'

import { google } from 'googleapis'
import { getGoogleAuthClient } from '@/lib/google-auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGoogleSheet(restaurantId: string, folderName = "HumHum Analytics") {
    const supabase = await createClient()
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('settings, name')
        .eq('id', restaurantId)
        .single()

    if (!restaurant?.settings?.google_auth?.tokens) {
        throw new Error("Google non connecté")
    }

    const auth = getGoogleAuthClient()
    auth.setCredentials(restaurant.settings.google_auth.tokens)

    const drive = google.drive({ version: 'v3', auth })
    const sheets = google.sheets({ version: 'v4', auth })

    // 1. Create Folder if not exists
    let folderId: string | null = restaurant.settings.google_sheet_folder_id || null

    if (!folderId) {
        const folderResponse = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder'
            },
            fields: 'id'
        })
        folderId = folderResponse.data.id!
    }

    // 2. Create Spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: `Rapport - ${restaurant.name} - ${new Date().toLocaleDateString('fr-FR')}`
            }
        },
        fields: 'spreadsheetId,spreadsheetUrl'
    })

    const spreadsheetId = spreadsheet.data.spreadsheetId!

    // 3. Move to folder
    if (folderId) {
        await drive.files.update({
            fileId: spreadsheetId,
            addParents: folderId,
            removeParents: 'root',
            fields: 'id, parents'
        })
    }

    // 4. Initialize Headers
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
            values: [["Date Sync", "Produit", "Commandés", "Servis", "Revenue"]]
        }
    })

    // 5. Update Restaurant Settings
    const updatedSettings = {
        ...restaurant.settings,
        google_sheet_id: spreadsheetId,
        google_sheet_url: spreadsheet.data.spreadsheetUrl,
        google_sheet_folder_id: folderId
    }

    await supabase
        .from('restaurants')
        .update({ settings: updatedSettings })
        .eq('id', restaurantId)

    revalidatePath('/dashboard/analytics')
    return { success: true, url: spreadsheet.data.spreadsheetUrl }
}

export async function disconnectGoogle() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, settings')
        .eq('owner_id', user.id)
        .single()

    if (restaurant) {
        const { google_auth, google_sheet_id, google_sheet_url, ...rest } = restaurant.settings
        await supabase
            .from('restaurants')
            .update({ settings: rest })
            .eq('id', restaurant.id)
    }

    revalidatePath('/dashboard/analytics')
}
