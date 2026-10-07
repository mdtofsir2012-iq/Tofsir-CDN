import CreateApiKeyButton from '@/components/dashboard/CreateApiKey'
import ApiKeyCard from '@/components/dashboard/ApiKeyCard'
import { getApiKeysData } from '@/lib/dashboard-data'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
   const { user } = await getCurrentUser()
  const apiKeys = await getApiKeysData(user.id)
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">API Keys</h1>
          <p className="text-sm text-[#555] mt-1">
            Authenticate your API requests with these keys
          </p>
        </div>
        <CreateApiKeyButton />
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {apiKeys.length === 0 ? (
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-12 text-center space-y-3">
            <div className="w-10 h-10 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto text-[#666]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#ccc]">No API keys</p>
              <p className="text-xs text-[#555] mt-0.5">Create an API key to start uploading via API</p>
            </div>
          </div>
        ) : (
          apiKeys.map((key) => (
            <ApiKeyCard
              key={key.id}
              id={key.id}
              name={key.name}
              apiKey={key.key}
              usageCount={key.usageCount || 0}
              type={key.type || 'all'}
              defaultLang={key.defaultLang}
              createdAt={key.createdAt instanceof Date ? key.createdAt.toISOString() : (key.createdAt?.toDate ? key.createdAt.toDate().toISOString() : new Date().toISOString())}
            />
          ))
        )}
      </div>

    </div>
  )
}
