
// AdvancedSettings.js
import React, {useState, useEffect} from 'react';
import {useConfig} from "../providers/ConfigContext.js";

const AdvancedSettings = () => {
    const {settings, updateSection, loading} = useConfig();
    const [formData, setFormData] = useState({
        keepalive: '10 120',
        max_clients: 100,
        user: 'nobody',
        group: 'nogroup',
        custom_directives: []
    });

    const [newDirective, setNewDirective] = useState('');

    useEffect(() => {
        if (settings.advanced) {
            setFormData(settings.advanced);
        }
    }, [settings.advanced]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddDirective = () => {
        if (newDirective && newDirective.trim() !== '') {
            setFormData(prev => ({
                ...prev,
                custom_directives: [...prev.custom_directives, newDirective.trim()]
            }));
            setNewDirective('');
        }
    };

    const handleRemoveDirective = (index) => {
        setFormData(prev => ({
            ...prev,
            custom_directives: prev.custom_directives.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateSection('advanced', formData);
    };

    return (
        <div className="card">
            <h2>Advanced Settings</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Keepalive Settings (interval retry)</label>
                    <input
                        type="text"
                        name="keepalive"
                        value={formData.keepalive}
                        onChange={handleChange}
                        placeholder="e.g. 10 120"
                    />
                    <small>Format: [interval] [retry] (seconds)</small>
                </div>

                <div className="form-group">
                    <label>Maximum Clients</label>
                    <input
                        type="number"
                        name="max_clients"
                        value={formData.max_clients}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>User</label>
                    <input
                        type="text"
                        name="user"
                        value={formData.user}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Group</label>
                    <input
                        type="text"
                        name="group"
                        value={formData.group}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Custom Directives</label>
                    <div className="directives-list">
                        {formData.custom_directives.map((directive, index) => (
                            <div key={index} className="directive-item">
                                <code>{directive}</code>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDirective(index)}
                                    className="remove-btn"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="directive-input">
            <textarea
                value={newDirective}
                onChange={(e) => setNewDirective(e.target.value)}
                placeholder="Add custom OpenVPN directive"
                rows={3}
            />
                        <button type="button" onClick={handleAddDirective}>Add Directive</button>
                    </div>
                    <small className="warning">
                        Note: Custom directives have highest priority and may override settings from other sections.
                    </small>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Advanced Settings'}
                </button>
            </form>
        </div>
    );
};