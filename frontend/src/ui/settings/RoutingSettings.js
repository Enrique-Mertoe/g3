
// RoutingSettings.js
import React, { useState, useEffect } from 'react';
import {useConfig} from "../providers/ConfigContext.js";

const RoutingSettings = () => {
  const { settings, updateSection, loading } = useConfig();
  const [formData, setFormData] = useState({
    push_redirect_gateway: true,
    client_to_client: false,
    routes: []
  });

  const [newRoute, setNewRoute] = useState({
    network: '',
    netmask: ''
  });

  useEffect(() => {
    if (settings.routing) {
      setFormData(settings.routing);
    }
  }, [settings.routing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRouteChange = (e) => {
    const { name, value } = e.target;
    setNewRoute(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRoute = () => {
    if (newRoute.network && newRoute.netmask) {
      setFormData(prev => ({
        ...prev,
        routes: [...prev.routes, { ...newRoute }]
      }));
      setNewRoute({ network: '', netmask: '' });
    }
  };

  const handleRemoveRoute = (index) => {
    setFormData(prev => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSection('routing', formData);
  };

  return (
    <div className="card">
      <h2>Routing Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group checkbox">
          <input
            type="checkbox"
            name="push_redirect_gateway"
            checked={formData.push_redirect_gateway}
            onChange={handleChange}
            id="push_redirect_gateway"
          />
          <label htmlFor="push_redirect_gateway">Redirect all client traffic through VPN</label>
        </div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            name="client_to_client"
            checked={formData.client_to_client}
            onChange={handleChange}
            id="client_to_client"
          />
          <label htmlFor="client_to_client">Allow clients to see each other</label>
        </div>

        <div className="form-group">
          <label>Additional Routes</label>
          <div className="routes-list">
            {formData.routes.map((route, index) => (
              <div key={index} className="route-item">
                <span>Network: {route.network} / Netmask: {route.netmask}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRoute(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="route-inputs">
            <input
              type="text"
              name="network"
              value={newRoute.network}
              onChange={handleRouteChange}
              placeholder="Network (e.g. 192.168.1.0)"
            />
            <input
              type="text"
              name="netmask"
              value={newRoute.netmask}
              onChange={handleRouteChange}
              placeholder="Netmask (e.g. 255.255.255.0)"
            />
            <button type="button" onClick={handleAddRoute}>Add Route</button>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Routing Settings'}
        </button>
      </form>
    </div>
  );
};

