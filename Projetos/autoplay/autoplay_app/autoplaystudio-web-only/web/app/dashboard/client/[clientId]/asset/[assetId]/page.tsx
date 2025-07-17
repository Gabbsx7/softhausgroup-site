'use client'

import { useParams } from 'next/navigation'

export default function ClientAssetPage() {
  const params = useParams()
  const { clientId, assetId } = params

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Client Asset View</h1>
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>Client ID: {clientId}</p>
        <p>Asset ID: {assetId}</p>
        <p>Context: Asset View (Client Context)</p>
      </div>
    </div>
  )
}
