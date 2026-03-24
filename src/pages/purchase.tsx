import PurchaseForm from '@/components/purchase-form/PurchaseForm';
import SummaryCard from '@/components/PurchaseCard'
import PurchaseTable from '@/components/PurchaseTable'
import { Card, CardContent } from '@/components/ui/card';
import { getSummaryCardsData } from '@/lib/mock/purchase-data'
import { useState } from 'react';

const purchase = () => {
    const summaryCards = getSummaryCardsData();
    const [isPurchaseFormOn, setIsPurchaseFormOn] = useState(false);
    if (isPurchaseFormOn) {
        return (
            <div className="px-2 sm:px-4">
                <Card className="w-full p-4 sm:p-6 bg-white">
                    <p className="font-semibold text-2xl">Create Purchase Form</p>
                    <CardContent className="mt-2">
                        <PurchaseForm onCancel={() => setIsPurchaseFormOn(false)} />
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (

        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 w-full">
            <div className=" mx-auto space-y-8">
                {/* Summary Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summaryCards.map((card, index) => (
                        <SummaryCard key={index} {...card} />
                    ))}
                </div>

                {/* Purchase Table Section */}
                <PurchaseTable setIsPurchaseFormOn={setIsPurchaseFormOn} />
            </div>
        </div>

    )
}

export default purchase
