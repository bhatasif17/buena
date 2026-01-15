import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Plus, Trash2, MoreVertical } from 'lucide-react';
import { fetchProperties, deleteProperty } from '../api';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const loadProperties = useCallback(async () => {
    try {
      const data = await fetchProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  async function handleDelete(id, event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this property?')) {
      setActiveMenu(null);
      return;
    }

    try {
      await deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
    setActiveMenu(null);
  }

  function handleMenuToggle(propertyId, event) {
    event.stopPropagation();
    setActiveMenu(prev => prev === propertyId ? null : propertyId);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short'
    });
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        Loading properties...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2>Properties</h2>
            <p>Manage your property portfolio</p>
          </div>
          <Link to="/create" className="btn btn-primary">
            <Plus size={18} />
            Create Property
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Building2 size={32} />
            </div>
            <h3>No properties yet</h3>
            <p>Get started by creating your first property</p>
            <Link to="/create" className="btn btn-primary">
              <Plus size={18} />
              Create Property
            </Link>
          </div>
        </div>
      ) : (
        <div className="property-grid">
          {properties.map(property => (
            <div
              key={property.id}
              className="property-card"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              <div className="property-card-header">
                <div>
                  <h3 className="property-card-title">{property.name}</h3>
                  <div className="property-card-number">{property.property_number}</div>
                </div>
                <div className="property-card-actions-header">
                  <span className={`badge badge-${property.type.toLowerCase()}`}>
                    {property.type}
                  </span>
                  <div className="dropdown-container">
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={(e) => handleMenuToggle(property.id, e)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === property.id && (
                      <div className="dropdown-menu">
                        <button
                          className="dropdown-item dropdown-item-danger"
                          onClick={(e) => handleDelete(property.id, e)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="property-card-stats">
                <div className="property-card-stat">
                  <div className="property-card-stat-value">{property.building_count}</div>
                  <div className="property-card-stat-label">Buildings</div>
                </div>
                <div className="property-card-stat">
                  <div className="property-card-stat-value">{property.unit_count}</div>
                  <div className="property-card-stat-label">Units</div>
                </div>
                <div className="property-card-stat">
                  <div className="property-card-stat-value">{formatDate(property.created_at)}</div>
                  <div className="property-card-stat-label">Created</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
