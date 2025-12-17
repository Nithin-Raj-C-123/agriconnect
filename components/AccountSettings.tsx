
import React, { useState, useRef } from 'react';
import { User, Role, Language, PayoutPreference } from '../types';
import { User as UserIcon, Settings, CreditCard, LogOut, Info, Shield, Moon, Sun, Clock, HelpCircle, Save, Edit3, Globe, Activity, Ban, Unlock, Bell, FileText, Smartphone, Mail, Download, Lock, CheckCircle, AlertTriangle, Key, History, ToggleLeft, ToggleRight, Trash2, Camera, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_USERS } from '../services/mockStore';

interface AccountSettingsProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onUnblockUser?: (userId: string) => void;
}

type Tab = 'info' | 'banking' | 'security' | 'notifications' | 'compliance' | 'blocked' | 'about';

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onLogout, onUpdateUser, onUnblockUser }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  
  // Profile Picture State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for edits
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    aadharNumber: user.aadharNumber || '',
    gstNumber: user.gstNumber || '',
  });

  const [bankData, setBankData] = useState({
    accountHolderName: user.bankDetails?.accountHolderName || '',
    phoneNumber: user.bankDetails?.phoneNumber || '',
    accountNumber: user.bankDetails?.accountNumber || '',
    ifscCode: user.bankDetails?.ifscCode || '',
    branchName: user.bankDetails?.branchName || '',
    upiId: user.bankDetails?.upiId || '',
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const [payoutPref, setPayoutPref] = useState<PayoutPreference>(user.payoutPreference || 'Bank');
  const [notifications, setNotifications] = useState(user.notificationPreferences || {
    channels: { sms: true, whatsapp: true, email: false, inApp: true },
    alerts: { priceDrop: true, weather: true, crisis: true, payment: true, orders: true }
  });

  const [preferences, setPreferences] = useState({
    language: language || user.preferences?.language || 'English',
    darkMode: user.preferences?.darkMode || false,
    timeManagement: user.preferences?.timeManagement || '30 mins'
  });

  // Fetch blocked user details
  const blockedList = MOCK_USERS.filter(u => user.blockedUsers?.includes(u.id));

  // --- Avatar Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Simple validation
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = () => {
    if (avatarPreview) {
      onUpdateUser({ ...user, avatar: avatarPreview });
      setAvatarPreview(null);
      alert("Profile picture updated successfully!");
    }
  };

  const removeAvatar = () => {
    if (window.confirm("Remove current profile picture?")) {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
      onUpdateUser({ ...user, avatar: defaultAvatar });
      setAvatarPreview(null);
    }
  };

  const cancelAvatarEdit = () => {
    setAvatarPreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Existing Handlers ---
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...user, ...formData });
    setIsEditingProfile(false);
    alert("Profile Updated Successfully!");
  };

  const handleBankSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...user, bankDetails: bankData, payoutPreference: payoutPref });
    setIsEditingBank(false);
    alert("Banking Details Updated Successfully!");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.current !== user.password && passwordForm.current !== '1234') { 
        alert("Incorrect current password."); return; 
    }
    if (passwordForm.new !== passwordForm.confirm) { 
        alert("New passwords do not match."); return; 
    }
    if (passwordForm.new.length < 4) { 
        alert("Password must be at least 4 characters."); return; 
    }
    onUpdateUser({ ...user, password: passwordForm.new });
    setIsChangingPassword(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    alert("Password updated successfully.");
  };

  const handleNotifSave = () => {
    onUpdateUser({ ...user, notificationPreferences: notifications });
    alert("Notification Preferences Saved");
  };

  const toggleTheme = () => {
    const newPref = { ...preferences, darkMode: !preferences.darkMode };
    setPreferences(newPref);
    onUpdateUser({ ...user, preferences: newPref });
  };

  const renderAccountInfo = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Profile Picture Management */}
        <div className="flex flex-col items-center mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
           <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-slate-200 bg-white">
                 <img 
                   src={avatarPreview || user.avatar} 
                   alt={user.name} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 />
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                 <Camera className="text-white drop-shadow-md" size={32} />
              </div>
              {avatarPreview && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white animate-bounce">
                  <UploadCloud size={16} />
                </div>
              )}
           </div>
           
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*" 
             onChange={handleFileChange}
           />

           <div className="mt-4 flex items-center gap-3">
              {avatarPreview ? (
                <>
                  <button 
                    onClick={saveAvatar} 
                    className="text-xs bg-agri-600 text-white px-4 py-2 rounded-full font-bold hover:bg-agri-700 transition-colors flex items-center gap-1 shadow-md hover:shadow-lg"
                  >
                    <CheckCircle size={14} /> Save New Picture
                  </button>
                  <button 
                    onClick={cancelAvatarEdit} 
                    className="text-xs bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <ImageIcon size={14} /> Change Photo
                    </button>
                    <button 
                      onClick={removeAvatar} 
                      className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Supported: JPG, PNG (Max 5MB)</p>
                </div>
              )}
           </div>
        </div>

        <div className="flex justify-between items-start mb-6">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <UserIcon className="text-agri-600" /> Account Information
           </h3>
           <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-xs font-medium text-agri-600 hover:underline flex items-center gap-1">
             <Edit3 size={14} /> {isEditingProfile ? 'Cancel' : 'Edit'}
           </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-slate-500">Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Phone Number</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Aadhar Number</label><input type="text" value={formData.aadharNumber} onChange={e => setFormData({...formData, aadharNumber: e.target.value})} className="w-full p-2 border rounded-lg text-sm bg-slate-50" disabled /></div>
            {user.role === Role.BUYER && <div><label className="text-xs font-semibold text-slate-500">GST Number</label><input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="GSTIN" /></div>}
            <div className="md:col-span-2 mt-2"><button type="submit" className="bg-agri-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button></div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-200 p-2 rounded-full"><UserIcon size={18} className="text-slate-500" /></div>
              <div className="overflow-hidden"><p className="text-xs text-slate-500 uppercase font-bold">Name</p><p className="font-medium text-slate-800 truncate">{user.name}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-200 p-2 rounded-full"><Mail size={18} className="text-slate-500" /></div>
              <div className="overflow-hidden"><p className="text-xs text-slate-500 uppercase font-bold">Email</p><p className="font-medium text-slate-800 truncate">{user.email}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-200 p-2 rounded-full"><Smartphone size={18} className="text-slate-500" /></div>
              <div><p className="text-xs text-slate-500 uppercase font-bold">Phone</p><p className="font-medium text-slate-800">{user.phone}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-200 p-2 rounded-full"><Shield size={18} className="text-slate-500" /></div>
              <div><p className="text-xs text-slate-500 uppercase font-bold">User ID</p><p className="font-mono text-slate-600 text-sm truncate w-32">{user.id}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="bg-slate-200 p-2 rounded-full"><Activity size={18} className="text-slate-500" /></div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">KYC Status</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.kycStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{user.kycStatus || 'Pending'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Quick Preferences */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings className="text-slate-600" /> Quick Preferences</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
               <div className="flex items-center gap-2"><Globe size={18} className="text-slate-400" /><span className="text-sm font-medium text-slate-700">Language</span></div>
               <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="text-sm bg-slate-50 border border-slate-200 rounded p-1 outline-none"><option>English</option><option>Hindi</option><option>Kannada</option><option>Tamil</option><option>Telugu</option><option>Malayalam</option><option>Bengali</option><option>Marathi</option><option>Gujarati</option><option>Odia</option></select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
               <div className="flex items-center gap-2">{preferences.darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-500" />}<span className="text-sm font-medium text-slate-700">Theme</span></div>
               <button onClick={toggleTheme} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors">{preferences.darkMode ? 'Light Mode' : 'Dark Mode'}</button>
            </div>
         </div>
      </div>
    </div>
  );

  const renderBanking = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <CreditCard className="text-blue-600" /> Banking & Payouts
           </h3>
           <button onClick={() => setIsEditingBank(!isEditingBank)} className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
             <Edit3 size={14} /> {isEditingBank ? 'Cancel' : 'Edit Details'}
           </button>
        </div>

        {isEditingBank ? (
          <form onSubmit={handleBankSave} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-slate-500">Account Holder</label><input type="text" value={bankData.accountHolderName} onChange={e => setBankData({...bankData, accountHolderName: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-semibold text-slate-500">Account Number</label><input type="text" value={bankData.accountNumber} onChange={e => setBankData({...bankData, accountNumber: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-semibold text-slate-500">IFSC Code</label><input type="text" value={bankData.ifscCode} onChange={e => setBankData({...bankData, ifscCode: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-semibold text-slate-500">Branch Name</label><input type="text" value={bankData.branchName} onChange={e => setBankData({...bankData, branchName: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-semibold text-slate-500">UPI ID</label><input type="text" value={bankData.upiId} onChange={e => setBankData({...bankData, upiId: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Preferred Payout</label>
                  <select value={payoutPref} onChange={e => setPayoutPref(e.target.value as PayoutPreference)} className="w-full p-2 border rounded-lg text-sm bg-white">
                    <option value="Bank">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
             </div>
             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Save Banking Info</button>
          </form>
        ) : (
          <div className="space-y-6">
             <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                   <div><p className="text-xs text-slate-500 uppercase">Account Holder</p><p className="font-bold text-slate-800">{user.bankDetails?.accountHolderName || '-'}</p></div>
                   <div><p className="text-xs text-slate-500 uppercase">Bank Name</p><p className="font-bold text-slate-800">Baroda Bank (Mock)</p></div>
                   <div><p className="text-xs text-slate-500 uppercase">Account Number</p><p className="font-mono text-slate-800 tracking-wider">{user.bankDetails?.accountNumber || '-'}</p></div>
                   <div><p className="text-xs text-slate-500 uppercase">IFSC Code</p><p className="font-mono text-slate-800">{user.bankDetails?.ifscCode || '-'}</p></div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10"><CreditCard size={120} /></div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                   <p className="text-xs text-slate-500 mb-1">UPI ID</p>
                   <p className="font-medium text-slate-800">{user.bankDetails?.upiId || 'Not set'}</p>
                </div>
                <div className="p-3 border rounded-lg">
                   <p className="text-xs text-slate-500 mb-1">Payout Preference</p>
                   <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{user.payoutPreference || 'Bank'}</span>
                </div>
             </div>
          </div>
        )}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-in fade-in">
       {/* Change Password */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock className="text-slate-600"/> Security & Password</h3>
          
          {!isChangingPassword ? (
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
               <div>
                 <p className="font-medium text-slate-800">Password</p>
                 <p className="text-xs text-slate-500">Last changed: 3 months ago</p>
               </div>
               <button onClick={() => setIsChangingPassword(true)} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-50">Change Password</button>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="bg-slate-50 p-4 rounded-lg space-y-3">
               <div><input type="password" placeholder="Current Password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full p-2 border rounded text-sm"/></div>
               <div><input type="password" placeholder="New Password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full p-2 border rounded text-sm"/></div>
               <div><input type="password" placeholder="Confirm New Password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full p-2 border rounded text-sm"/></div>
               <div className="flex gap-2">
                 <button type="submit" className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm font-bold">Update</button>
                 <button type="button" onClick={() => setIsChangingPassword(false)} className="text-slate-500 text-sm hover:underline">Cancel</button>
               </div>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between">
             <div>
               <p className="font-medium text-slate-800">Two-Factor Authentication (2FA)</p>
               <p className="text-xs text-slate-500">Secure your account with OTP.</p>
             </div>
             <button onClick={() => alert("OTP Sent to mobile number.")} className={`w-12 h-6 rounded-full p-1 transition-colors ${user.twoFactorEnabled ? 'bg-green-500' : 'bg-slate-300'}`}>
               <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${user.twoFactorEnabled ? 'translate-x-6' : ''}`}></div>
             </button>
          </div>
       </div>

       {/* Login History */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><History className="text-slate-600"/> Login History</h3>
          <div className="space-y-3">
             {user.securityLogs?.map(log => (
               <div key={log.id} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded">
                  <div>
                    <p className="font-medium text-slate-800">{log.device}</p>
                    <p className="text-xs text-slate-500">{log.location} • {log.ip}</p>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
               </div>
             ))}
             {!user.securityLogs && <p className="text-sm text-slate-400 italic">No logs available.</p>}
          </div>
          <button className="mt-4 text-red-600 text-sm font-bold hover:underline w-full text-left">Logout of all other devices</button>
       </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Bell className="text-amber-500"/> Notification Preferences</h3>
         <button onClick={handleNotifSave} className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-slate-800">Save Changes</button>
       </div>

       <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Channels</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {Object.entries(notifications.channels).map(([key, val]) => (
                 <label key={key} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <span className="capitalize font-medium text-slate-700">{key === 'inApp' ? 'In-App' : key}</span>
                    <button 
                      onClick={() => setNotifications({...notifications, channels: {...notifications.channels, [key]: !val}})}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors ${val ? 'bg-agri-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${val ? 'translate-x-5' : ''}`}></div>
                    </button>
                 </label>
               ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Alert Types</h4>
            <div className="space-y-2">
               {Object.entries(notifications.alerts).map(([key, val]) => (
                 <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" checked={val} onChange={() => setNotifications({...notifications, alerts: {...notifications.alerts, [key]: !val}})} className="w-4 h-4 text-agri-600 rounded" />
                    <span className="text-sm text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Alerts</span>
                 </label>
               ))}
            </div>
          </div>
       </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText className="text-slate-600"/> Documents & KYC</h3>
          <div className="space-y-3">
             {user.documents?.map(doc => (
               <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                     <FileText size={20} className="text-slate-400" />
                     <div>
                       <p className="font-bold text-slate-800 text-sm">{doc.type}</p>
                       <p className="text-xs text-slate-500">Uploaded: {doc.uploadedAt}</p>
                     </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{doc.status}</span>
               </div>
             ))}
             
             <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <Download size={18} /> Upload New Document
             </button>
          </div>
       </div>

       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Download Statements</h3>
          <div className="grid grid-cols-2 gap-4">
             <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 transition-all">
                <FileText className="mb-2 text-slate-600" />
                <span className="text-sm font-bold text-slate-700">Tax Report</span>
             </button>
             <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 transition-all">
                <Activity className="mb-2 text-slate-600" />
                <span className="text-sm font-bold text-slate-700">Trade History</span>
             </button>
          </div>
       </div>
    </div>
  );

  const renderBlocked = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
       <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Ban className="text-red-500"/> Blocked Users</h3>
       {blockedList.length === 0 ? (
         <div className="text-center py-8 text-slate-400">
           <p>No blocked users.</p>
         </div>
       ) : (
         <div className="space-y-3">
           {blockedList.map(blockedUser => (
             <div key={blockedUser.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                   <img src={blockedUser.avatar} alt="" className="w-10 h-10 rounded-full" />
                   <div>
                     <p className="font-bold text-slate-800">{blockedUser.name}</p>
                     <p className="text-xs text-slate-500">{blockedUser.role}</p>
                   </div>
                </div>
                <button 
                  onClick={() => onUnblockUser && onUnblockUser(blockedUser.id)}
                  className="text-xs bg-slate-100 hover:bg-green-50 text-slate-600 hover:text-green-600 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
                >
                  <Unlock size={12} /> Unblock
                </button>
             </div>
           ))}
         </div>
       )}
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${activeTab === id ? 'bg-agri-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Account Settings</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <TabButton id="info" label="Profile" icon={UserIcon} />
            <TabButton id="banking" label="Banking" icon={CreditCard} />
            <TabButton id="security" label="Security" icon={Lock} />
            <TabButton id="notifications" label="Notifs" icon={Bell} />
            <TabButton id="compliance" label="Docs" icon={FileText} />
            <TabButton id="blocked" label="Blocked" icon={Ban} />
            <TabButton id="about" label="About" icon={Info} />
            <div className="pt-2 mt-2 border-t border-slate-200">
               <button onClick={onLogout} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium text-red-600 hover:bg-red-50 transition-colors">
                 <LogOut size={18} /> Logout
               </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
           {activeTab === 'info' && renderAccountInfo()}
           {activeTab === 'banking' && renderBanking()} 
           {activeTab === 'security' && renderSecurity()}
           {activeTab === 'notifications' && renderNotifications()}
           {activeTab === 'compliance' && renderCompliance()}
           {activeTab === 'blocked' && renderBlocked()}
           {activeTab === 'about' && (
             <div className="bg-white p-8 rounded-xl border border-slate-200 text-center animate-in zoom-in-95 shadow-sm">
                <Shield className="h-12 w-12 text-agri-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-2">AgriLink</h1>
                <p className="text-slate-500 mb-6">Version 2.7.0 (Beta)</p>
                <div className="max-w-md mx-auto text-sm text-slate-600 space-y-2">
                  <p>Empowering farmers with AI technology and direct market access.</p>
                  <p className="pt-4 text-slate-400 text-xs">© 2024 AgriLink Marketplace. All rights reserved.</p>
                  <div className="pt-2 text-xs text-slate-400">
                    Credits: Created by Nithin Raj C<br/>
                    Contact: 8660591572
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
