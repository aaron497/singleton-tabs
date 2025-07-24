import { useEffect, useState } from 'react'

export default function Popup() {
  const [domains, setDomains] = useState<string[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load initial domains from storage
    browser.runtime.sendMessage({ type: 'GET_DOMAINS' })
      .then(domains => {
        setDomains(domains || [])
        setIsLoading(false)
      })
  }, [])

  const addDomain = () => {
    if (!newDomain) return
    const updatedDomains = [...domains, newDomain]
    setDomains(updatedDomains)
    setNewDomain('')
    browser.runtime.sendMessage({
      type: 'UPDATE_DOMAINS',
      domains: updatedDomains
    })
  }

  const removeDomain = (index: number) => {
    const updatedDomains = domains.filter((_, i) => i !== index)
    setDomains(updatedDomains)
    browser.runtime.sendMessage({
      type: 'UPDATE_DOMAINS',
      domains: updatedDomains
    })
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4 w-80">
      <h1 className="text-xl font-bold mb-4">Single Tab Domains</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Enter domain (e.g. gmail.com)"
          className="flex-1 px-2 py-1 border rounded"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addDomain()
            }
          }}
        />
        <button
          onClick={addDomain}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {domains.map((domain, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>{domain}</span>
            <button
              onClick={() => removeDomain(index)}
              className="text-red-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}