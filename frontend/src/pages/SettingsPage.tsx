import Layout from "./home-components/Layout.tsx";

export default function SettingsPage() {
    return (
        <Layout>
            <div className="p-6">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
        Settings have been saved successfully.
        <button className="absolute top-2 right-2 text-green-700 hover:text-green-900">&times;</button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <i className="fas fa-cogs"></i> OpenVPN Advanced Settings
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <i className="fas fa-save mr-2"></i>Save All Changes
        </button>
      </div>

      <div className="bg-white shadow rounded">
        <div className="border-b">
          <ul className="flex space-x-4 px-4 pt-4">
            {['General', 'Network', 'Security', 'Routing', 'Advanced'].map((tab, i) => (
              <li key={i}>
                <button className={`pb-2 px-3 ${tab === 'Advanced' ? 'border-b-4 font-bold border-blue-600' : 'text-gray-700'}`}>
                  <i className={`fas ${
                    tab === 'General' ? 'fa-sliders-h' :
                    tab === 'Network' ? 'fa-network-wired' :
                    tab === 'Security' ? 'fa-shield-alt' :
                    tab === 'Routing' ? 'fa-route' : 'fa-code'} mr-2`}></i>
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6">
          {/* Advanced Tab Content */}
          <form className="max-w-4xl mx-auto">
            <div className="mb-8 p-6 bg-gray-100 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Performance Tuning</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-gray-700">Compression</label>
                <select className="col-span-1 md:col-span-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200">
                  <option value="none">None (recommended)</option>
                  <option value="lz4">LZ4</option>
                  <option value="lz4-v2">LZ4-v2</option>
                  <option value="lzo">LZO (legacy)</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <i className="fas fa-info-circle mr-1"></i>
                Data compression method. Note: Compression can potentially weaken security.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
        </Layout>
    )
}