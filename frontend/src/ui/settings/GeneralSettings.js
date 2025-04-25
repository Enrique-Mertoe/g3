// GeneralSettings.js
import React, { useState, useEffect } from 'react';
import {useConfig} from "../providers/ConfigContext.js";

const GeneralSettings = () => {
  const { settings, updateSection, loading } = useConfig();
  const [formData, setFormData] = useState({
    server_name: '',
    port: 1194,
    protocol: 'udp',
    device: 'tun',
    cipher: 'AES-256-GCM',
    auth: 'SHA256'
  });

  useEffect(() => {
    if (settings.general) {
      setFormData(settings.general);
    }
  }, [settings.general]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSection('general', formData);
  };

  return (
    <div className="card">
      <h2>General Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Server Name</label>
          <input
            type="text"
            name="server_name"
            value={formData.server_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Port</label>
          <input
            type="number"
            name="port"
            value={formData.port}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Protocol</label>
          <select name="protocol" value={formData.protocol} onChange={handleChange}>
            <option value="udp">UDP</option>
            <option value="tcp">TCP</option>
          </select>
        </div>

        <div className="form-group">
          <label>Device</label>
          <select name="device" value={formData.device} onChange={handleChange}>
            <option value="tun">TUN</option>
            <option value="tap">TAP</option>
          </select>
        </div>

        <div className="form-group">
          <label>Cipher</label>
          <select name="cipher" value={formData.cipher} onChange={handleChange}>
            <option value="AES-256-GCM">AES-256-GCM</option>
            <option value="AES-128-GCM">AES-128-GCM</option>
            <option value="AES-256-CBC">AES-256-CBC</option>
            <option value="AES-128-CBC">AES-128-CBC</option>
          </select>
        </div>

        <div className="form-group">
          <label>Authentication Algorithm</label>
          <select name="auth" value={formData.auth} onChange={handleChange}>
            <option value="SHA256">SHA256</option>
            <option value="SHA1">SHA1</option>
            <option value="SHA512">SHA512</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save General Settings'}
        </button>
      </form>
    </div>
  );
};
