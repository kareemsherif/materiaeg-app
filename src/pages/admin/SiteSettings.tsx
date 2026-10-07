import { useState, useEffect } from "react";
import { Save, Globe, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useContent } from "@/context/ContentContext";

export default function SiteSettings() {
  const { settings, updateSettings } = useContent();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await updateSettings(formData);
    if (ok) {
      toast.success("Settings saved successfully");
    } else {
      toast.error("Failed to save settings to the database");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900" style={{ fontFamily: "Playfair Display, serif" }}>
            Site Settings
          </h1>
          <p className="text-charcoal-500">Configure global website settings and contact information.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-cream-200 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-charcoal-900 border-b border-cream-100 pb-4">General Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal-700">Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName || "MATERIA"}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal-700">Tagline (English)</label>
                <input 
                  type="text" 
                  value={formData.tagline || "Premium Artificial Leather"}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-cream-200 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-charcoal-900 border-b border-cream-100 pb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal-700 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  WhatsApp Number
                </label>
                <input 
                  type="text" 
                  value={formData.whatsapp || ""}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="e.g. 201000000000"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-burgundy-900" />
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={formData.email || ""}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-burgundy-900" />
                  Working Hours (English)
                </label>
                <input 
                  type="text" 
                  value={formData.workingHours || ""}
                  onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                  placeholder="e.g. Mon – Sat: 8:00 AM – 5:00 PM"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-burgundy-900" />
                  Working Hours (Arabic)
                </label>
                <input 
                  type="text" 
                  value={formData.workingHoursAr || ""}
                  onChange={(e) => setFormData({...formData, workingHoursAr: e.target.value})}
                  placeholder="e.g. الاثنين – السبت: ٨:٠٠ ص – ٥:٠٠ م"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-burgundy-900" />
                Main Office Address
              </label>
              <input 
                type="text" 
                value={formData.address || ""}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Google Maps Embed URL
              </label>
              <textarea
                rows={3}
                value={formData.map_embed || ""}
                onChange={(e) => setFormData({...formData, map_embed: e.target.value})}
                placeholder="Paste the Google Maps embed URL here (e.g. https://www.google.com/maps/embed?pb=...)"
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none text-sm font-mono resize-none"
              />
              <p className="text-xs text-charcoal-400">
                Go to Google Maps → Share → Embed a map → Copy the <code className="bg-cream-100 px-1 rounded">src</code> URL only (not the full iframe code).
              </p>
            </div>
          </div>

          {/* AI Vision Settings */}
          <div className="bg-white p-8 rounded-2xl border border-cream-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-cream-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-charcoal-900 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-burgundy-50 text-burgundy-900 font-bold text-xs">AI</span>
                  Google Gemini AI (Leather Scanner)
                </h3>
                <p className="text-xs text-charcoal-500 mt-1">
                  Enables real multimodal computer vision analysis for the mobile leather scanner.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-charcoal-700">
                Google Gemini API Key
              </label>
              <input 
                type="text" 
                value={formData.gemini_api_key || ""}
                onChange={(e) => setFormData({...formData, gemini_api_key: e.target.value.trim()})}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none font-mono text-sm"
              />
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold">⚠️ How to get a free Google Gemini API Key:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-amber-800">
                  <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline font-bold text-burgundy-900">Google AI Studio (aistudio.google.com/apikey)</a>.</li>
                  <li>Click <strong>"Create API key"</strong> and copy the generated key (starts with <code className="bg-white px-1 py-0.5 rounded font-mono">AIzaSy...</code>).</li>
                  <li>Paste it above and click <strong>"Save Changes"</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4 sticky top-24">
            <h4 className="font-bold text-charcoal-900">Publish Changes</h4>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Saving these settings will update the website information in real-time for all users.
            </p>
            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 px-6 rounded-xl shadow-lg shadow-burgundy-900/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
              <Globe className="w-4 h-4" />
              Live Status
            </div>
            <p className="text-xs text-emerald-600/80 leading-relaxed">
              Your website is currently live and accessible.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
