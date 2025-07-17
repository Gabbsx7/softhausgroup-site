'use client'

import AssetCard from '@/components/project/AssetCard'

export default function TestAssetsPage() {
  // Dados de teste simulando a estrutura correta
  const testAssets = [
    {
      id: '1',
      name: 'Test Image.jpg',
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      thumbnail:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      type: 'image' as const,
      status: 'pending' as const,
      projectMembers: [],
    },
    {
      id: '2',
      name: 'Test Video.mp4',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      type: 'video' as const,
      status: 'approved' as const,
      projectMembers: [],
    },
    {
      id: '3',
      name: 'Test Document.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'document' as const,
      status: 'rejected' as const,
      projectMembers: [],
    },
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Test AssetCard Component</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testAssets.map((asset) => (
          <div key={asset.id}>
            <h3 className="text-sm font-semibold mb-2">
              Type: {asset.type} | Status: {asset.status}
            </h3>
            <AssetCard
              asset={asset}
              onApprove={(id) => console.log('Approve:', id)}
              onReject={(id) => console.log('Reject:', id)}
              onDelete={(id) => console.log('Delete:', id)}
              onDownload={(id) => console.log('Download:', id)}
              onViewAsset={(asset) => console.log('View:', asset)}
              onClick={(asset) => console.log('Click:', asset)}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Console Output</h2>
        <p className="text-sm text-gray-600">
          Open browser console (F12) to see the AssetCard logs and interaction
          events.
        </p>
      </div>
    </div>
  )
}
