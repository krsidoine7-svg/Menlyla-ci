import { OrderList } from '@/components/modules/orders/components/order-list'

export default function OrdersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Commandes en cours</h1>
            </div>
            <OrderList />
        </div>
    )
}
