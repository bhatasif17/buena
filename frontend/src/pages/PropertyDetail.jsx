import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, User, Calculator, FileText, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchProperty, getUploadUrl } from '../api';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBuildings, setExpandedBuildings] = useState({});

  const loadProperty = useCallback(async () => {
    try {
      const data = await fetchProperty(id);
      setProperty(data);

      const expanded = {};
      data.buildings?.forEach(b => { expanded[b.id] = true; });
      setExpandedBuildings(expanded);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const getUnitsForBuilding = useCallback(
    (buildingId) => property?.units?.filter(u => u.building_id === buildingId) || [],
    [property?.units]
  );

  const unitsByType = useMemo(() => {
    return property?.units?.reduce((acc, unit) => {
      acc[unit.type] = (acc[unit.type] || 0) + 1;
      return acc;
    }, {}) || {};
  }, [property?.units]);

  const totalSize = useMemo(() => {
    return property?.units?.reduce((sum, u) => sum + (parseFloat(u.size_sqm) || 0), 0) || 0;
  }, [property?.units]);

  function toggleBuilding(buildingId) {
    setExpandedBuildings(prev => ({ ...prev, [buildingId]: !prev[buildingId] }));
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  function getPropertyTypeLabel(type) {
    return type === 'WEG' ? 'WEG - Owner Community' : 'MV - Rental Management';
  }

  function getPropertyTypeDescription(type) {
    return type === 'WEG' ? 'WEG (Owner Community)' : 'MV (Rental Management)';
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Building2 size={32} />
          </div>
          <h3>Property not found</h3>
          <p>The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-left">
          <button className="detail-back" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
          </button>
          <div className="detail-title">
            <h2>{property.name}</h2>
            <span>{property.property_number}</span>
          </div>
        </div>
        <span className={`badge badge-${property.type.toLowerCase()} badge-lg`}>
          {getPropertyTypeLabel(property.type)}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats summary-stats-mb">
        <div className="summary-stat">
          <div className="summary-stat-value">{property.buildings?.length || 0}</div>
          <div className="summary-stat-label">Buildings</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-value">{property.units?.length || 0}</div>
          <div className="summary-stat-label">Total Units</div>
        </div>
        {Object.entries(unitsByType).map(([type, count]) => (
          <div key={type} className="summary-stat">
            <div className="summary-stat-value">{count}</div>
            <div className="summary-stat-label">{type}s</div>
          </div>
        ))}
        <div className="summary-stat">
          <div className="summary-stat-value">{totalSize.toLocaleString()}</div>
          <div className="summary-stat-label">Total m²</div>
        </div>
      </div>

      {/* General Info */}
      <div className="card card-mb">
        <div className="card-header">
          <h3>Property Information</h3>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <label><FileText size={14} /> Property Number</label>
            <span>{property.property_number}</span>
          </div>
          <div className="detail-item">
            <label><Building2 size={14} /> Management Type</label>
            <span>{getPropertyTypeDescription(property.type)}</span>
          </div>
          <div className="detail-item">
            <label><User size={14} /> Property Manager</label>
            <span>{property.property_manager || 'Not assigned'}</span>
          </div>
          <div className="detail-item">
            <label><Calculator size={14} /> Accountant</label>
            <span>{property.accountant || 'Not assigned'}</span>
          </div>
          <div className="detail-item">
            <label><Calendar size={14} /> Created</label>
            <span>{formatDate(property.created_at)}</span>
          </div>
          {property.declaration_file && (
            <div className="detail-item">
              <label><FileText size={14} /> Declaration File</label>
              <a
                href={getUploadUrl(property.declaration_file)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary detail-item-btn"
              >
                View Document
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Buildings & Units */}
      <div className="detail-section">
        <h3 className="section-title">Buildings & Units</h3>
        {property.buildings?.map((building, index) => {
          const buildingUnits = getUnitsForBuilding(building.id);
          const isExpanded = expandedBuildings[building.id];

          return (
            <div key={building.id} className="building-card">
              <div
                className="building-card-header"
                onClick={() => toggleBuilding(building.id)}
              >
                <div className="building-card-title">
                  <Building2 size={18} className="icon-muted" />
                  <h4>{building.name || `Building ${index + 1}`}</h4>
                  <span>
                    <MapPin size={14} className="icon-inline" />
                    {building.street} {building.house_number}
                    {building.postal_code && `, ${building.postal_code}`}
                    {building.city && ` ${building.city}`}
                  </span>
                </div>
                <div className="building-card-actions">
                  <span className="badge badge-muted">
                    {buildingUnits.length} units
                  </span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="building-card-body building-card-body-flush">
                  {buildingUnits.length > 0 ? (
                    <div className="table-scroll">
                      <table className="unit-table">
                        <thead>
                          <tr>
                            <th>Unit #</th>
                            <th>Type</th>
                            <th>Floor</th>
                            <th>Entrance</th>
                            <th>Size m²</th>
                            <th>Share %</th>
                            <th>Year</th>
                            <th>Rooms</th>
                          </tr>
                        </thead>
                        <tbody>
                          {buildingUnits.map(unit => (
                            <tr key={unit.id}>
                              <td><strong>{unit.unit_number}</strong></td>
                              <td>
                                <span className={`badge badge-${unit.type.toLowerCase()}`}>
                                  {unit.type}
                                </span>
                              </td>
                              <td>{unit.floor ?? '-'}</td>
                              <td>{unit.entrance || '-'}</td>
                              <td>{unit.size_sqm ?? '-'}</td>
                              <td>{unit.co_ownership_share ? `${unit.co_ownership_share}%` : '-'}</td>
                              <td>{unit.construction_year ?? '-'}</td>
                              <td>{unit.rooms ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-units">
                      No units in this building
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
