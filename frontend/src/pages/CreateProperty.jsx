import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Upload, Plus, Trash2, Copy, ChevronDown, ChevronUp,
  Building2, Users, FileText, Zap, X, ArrowLeft
} from 'lucide-react';
import { createProperty } from '../api';

const UNIT_TYPES = ['Apartment', 'Office', 'Garden', 'Parking'];

const STEPS = [
  { number: 1, title: 'General Info', desc: 'Property type and details', icon: FileText },
  { number: 2, title: 'Buildings', desc: 'Add building addresses', icon: Building2 },
  { number: 3, title: 'Units', desc: 'Add apartments and spaces', icon: Users }
];

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyBuilding() {
  return {
    tempId: generateId('building'),
    name: '',
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
    construction_year: ''
  };
}

function createEmptyUnit(buildingId) {
  return {
    tempId: generateId('unit'),
    building_id: buildingId,
    unit_number: '',
    type: 'Apartment',
    floor: '',
    entrance: '',
    size_sqm: '',
    co_ownership_share: '',
    construction_year: '',
    rooms: ''
  };
}

export default function CreateProperty() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: General Info
  const [propertyType, setPropertyType] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [propertyManager, setPropertyManager] = useState('');
  const [accountant, setAccountant] = useState('');
  const [declarationFile, setDeclarationFile] = useState(null);

  // Step 2: Buildings
  const [buildings, setBuildings] = useState([createEmptyBuilding()]);

  // Step 3: Units
  const [units, setUnits] = useState([]);
  const [expandedBuildings, setExpandedBuildings] = useState({});

  // Quick add state
  const [quickAdd, setQuickAdd] = useState({
    building_id: '',
    startNumber: 1,
    count: 10,
    type: 'Apartment',
    floor: '',
    size_sqm: '',
    rooms: ''
  });

  const canProceedFromStep1 = propertyType && propertyName.trim();
  const canProceedFromStep2 = buildings.every(b => b.street.trim() && b.house_number.trim());

  const getUnitsForBuilding = useCallback(
    (buildingId) => units.filter(u => u.building_id === buildingId),
    [units]
  );

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setDeclarationFile(file);
    }
  }

  function addBuilding() {
    setBuildings(prev => [...prev, createEmptyBuilding()]);
  }

  function updateBuilding(index, field, value) {
    setBuildings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeBuilding(index) {
    if (buildings.length === 1) return;
    const buildingId = buildings[index].tempId;
    setBuildings(prev => prev.filter((_, i) => i !== index));
    setUnits(prev => prev.filter(u => u.building_id !== buildingId));
  }

  function addUnit(buildingId) {
    setUnits(prev => [...prev, createEmptyUnit(buildingId)]);
    setExpandedBuildings(prev => ({ ...prev, [buildingId]: true }));
  }

  function updateUnit(unitTempId, field, value) {
    setUnits(prev =>
      prev.map(u => (u.tempId === unitTempId ? { ...u, [field]: value } : u))
    );
  }

  function removeUnit(unitTempId) {
    setUnits(prev => prev.filter(u => u.tempId !== unitTempId));
  }

  function duplicateUnit(unit) {
    const newUnit = {
      ...unit,
      tempId: generateId('unit'),
      unit_number: ''
    };
    setUnits(prev => [...prev, newUnit]);
  }

  function quickAddUnits() {
    if (!quickAdd.building_id) return;

    const newUnits = Array.from({ length: quickAdd.count }, (_, i) => ({
      tempId: generateId('unit'),
      building_id: quickAdd.building_id,
      unit_number: String(quickAdd.startNumber + i),
      type: quickAdd.type,
      floor: quickAdd.floor,
      entrance: '',
      size_sqm: quickAdd.size_sqm,
      co_ownership_share: '',
      construction_year: '',
      rooms: quickAdd.rooms
    }));

    setUnits(prev => [...prev, ...newUnits]);
    setQuickAdd(prev => ({ ...prev, startNumber: prev.startNumber + prev.count }));
    setExpandedBuildings(prev => ({ ...prev, [quickAdd.building_id]: true }));
  }

  function toggleBuildingExpanded(buildingId) {
    setExpandedBuildings(prev => ({ ...prev, [buildingId]: !prev[buildingId] }));
  }

  function handleStepClick(stepNumber) {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    } else if (stepNumber === 2 && canProceedFromStep1) {
      setCurrentStep(stepNumber);
    } else if (stepNumber === 3 && canProceedFromStep2) {
      setCurrentStep(stepNumber);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', propertyName);
      formData.append('type', propertyType);
      formData.append('property_manager', propertyManager);
      formData.append('accountant', accountant);
      formData.append('buildings', JSON.stringify(buildings));
      formData.append('units', JSON.stringify(units));

      if (declarationFile) {
        formData.append('declaration_file', declarationFile);
      }

      await createProperty(formData);
      navigate('/');
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Failed to create property. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  }

  function renderStep1() {
    return (
      <div>
        <div className="wizard-content-header">
          <h3>General Information</h3>
          <p>Select the management type and enter basic property details</p>
        </div>

        <div className="form-section">
          <div className="form-section-title">Management Type</div>
          <div className="type-selector">
            <div
              className={`type-option ${propertyType === 'WEG' ? 'selected' : ''}`}
              onClick={() => setPropertyType('WEG')}
            >
              <div className="type-option-header">
                <div className="type-option-icon">
                  <Users size={20} />
                </div>
                <h4>WEG</h4>
              </div>
              <p>Communities of owners who share responsibility for common areas. Legally complex with voting and joint decisions.</p>
            </div>
            <div
              className={`type-option ${propertyType === 'MV' ? 'selected' : ''}`}
              onClick={() => setPropertyType('MV')}
            >
              <div className="type-option-header">
                <div className="type-option-icon">
                  <Building2 size={20} />
                </div>
                <h4>MV</h4>
              </div>
              <p>Rental properties managed for landlords. Focused on tenant contracts, rent collection, and maintenance.</p>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Property Details</div>
          <div className="form-group">
            <label>Property Name <span className="required">*</span></label>
            <input
              type="text"
              value={propertyName}
              onChange={e => setPropertyName(e.target.value)}
              placeholder="e.g., Parkview Residences Berlin"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Property Manager</label>
              <input
                type="text"
                value={propertyManager}
                onChange={e => setPropertyManager(e.target.value)}
                placeholder="e.g., ImmoGuard Berlin GmbH"
              />
            </div>
            <div className="form-group">
              <label>Accountant</label>
              <input
                type="text"
                value={accountant}
                onChange={e => setAccountant(e.target.value)}
                placeholder="e.g., FinanzExpertise Muller & Co KG"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Declaration of Division (Teilungserklarung)</div>
          <label className={`file-upload ${declarationFile ? 'has-file' : ''}`}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <div className="file-upload-icon">
              <Upload size={24} />
            </div>
            {declarationFile ? (
              <>
                <p className="file-upload-text file-upload-success">{declarationFile.name}</p>
                <p className="file-upload-hint">Click to replace</p>
              </>
            ) : (
              <>
                <p className="file-upload-text">Click to upload or drag and drop</p>
                <p className="file-upload-hint">PDF, DOC up to 10MB</p>
              </>
            )}
          </label>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div>
        <div className="wizard-content-header">
          <h3>Buildings</h3>
          <p>Add the buildings that belong to this property</p>
        </div>

        {buildings.map((building, index) => (
          <div key={building.tempId} className="building-card">
            <div className="building-card-header building-card-header-static">
              <div className="building-card-title">
                <Building2 size={18} className="icon-muted" />
                <h4>Building {index + 1}</h4>
                {building.name && <span>({building.name})</span>}
              </div>
              <div className="building-card-actions">
                {buildings.length > 1 && (
                  <button
                    className="btn btn-ghost btn-danger"
                    onClick={() => removeBuilding(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="building-card-body">
              <div className="form-group">
                <label>Building Name</label>
                <input
                  type="text"
                  value={building.name}
                  onChange={e => updateBuilding(index, 'name', e.target.value)}
                  placeholder="e.g., Haus A - Parkside"
                />
                <div className="form-hint">Optional identifier for this building</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Street <span className="required">*</span></label>
                  <input
                    type="text"
                    value={building.street}
                    onChange={e => updateBuilding(index, 'street', e.target.value)}
                    placeholder="e.g., Am Fiktivpark"
                  />
                </div>
                <div className="form-group">
                  <label>House Number <span className="required">*</span></label>
                  <input
                    type="text"
                    value={building.house_number}
                    onChange={e => updateBuilding(index, 'house_number', e.target.value)}
                    placeholder="e.g., 12"
                  />
                </div>
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={building.postal_code}
                    onChange={e => updateBuilding(index, 'postal_code', e.target.value)}
                    placeholder="e.g., 10557"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={building.city}
                    onChange={e => updateBuilding(index, 'city', e.target.value)}
                    placeholder="e.g., Berlin"
                  />
                </div>
                <div className="form-group">
                  <label>Construction Year</label>
                  <input
                    type="number"
                    value={building.construction_year}
                    onChange={e => updateBuilding(index, 'construction_year', e.target.value)}
                    placeholder="e.g., 2023"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-secondary btn-full-width" onClick={addBuilding}>
          <Plus size={16} /> Add Another Building
        </button>
      </div>
    );
  }

  function renderStep3() {
    const unitCounts = {
      total: units.length,
      apartments: units.filter(u => u.type === 'Apartment').length,
      offices: units.filter(u => u.type === 'Office').length,
      parking: units.filter(u => u.type === 'Parking').length
    };

    return (
      <div>
        <div className="wizard-content-header">
          <h3>Units</h3>
          <p>Add apartments, offices, parking spaces, and other units</p>
        </div>

        {/* Quick Add Section */}
        <div className="quick-add">
          <div className="quick-add-header">
            <Zap size={16} />
            <h4>Quick Add Multiple Units</h4>
          </div>
          <div className="quick-add-form">
            <div className="form-group quick-add-building-select">
              <label>Building</label>
              <select
                value={quickAdd.building_id}
                onChange={e => setQuickAdd(prev => ({ ...prev, building_id: e.target.value }))}
              >
                <option value="">Select building...</option>
                {buildings.map((b, i) => (
                  <option key={b.tempId} value={b.tempId}>
                    {b.name || `Building ${i + 1}`} - {b.street} {b.house_number}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Start #</label>
              <input
                type="number"
                value={quickAdd.startNumber}
                onChange={e => setQuickAdd(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="form-group">
              <label>Count</label>
              <input
                type="number"
                value={quickAdd.count}
                onChange={e => setQuickAdd(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                min="1"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={quickAdd.type}
                onChange={e => setQuickAdd(prev => ({ ...prev, type: e.target.value }))}
              >
                {UNIT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Floor</label>
              <input
                type="number"
                value={quickAdd.floor}
                onChange={e => setQuickAdd(prev => ({ ...prev, floor: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Size m²</label>
              <input
                type="number"
                value={quickAdd.size_sqm}
                onChange={e => setQuickAdd(prev => ({ ...prev, size_sqm: e.target.value }))}
                placeholder="75"
              />
            </div>
            <div className="form-group">
              <label>Rooms</label>
              <input
                type="number"
                value={quickAdd.rooms}
                onChange={e => setQuickAdd(prev => ({ ...prev, rooms: e.target.value }))}
                placeholder="3"
              />
            </div>
            <button
              className="btn btn-primary quick-add-btn"
              onClick={quickAddUnits}
              disabled={!quickAdd.building_id}
            >
              <Plus size={16} /> Add {quickAdd.count}
            </button>
          </div>
        </div>

        {/* Units by Building */}
        {buildings.map((building, buildingIndex) => {
          const buildingUnits = getUnitsForBuilding(building.tempId);
          const isExpanded = expandedBuildings[building.tempId] !== false;

          return (
            <div key={building.tempId} className="building-card">
              <div
                className="building-card-header"
                onClick={() => toggleBuildingExpanded(building.tempId)}
              >
                <div className="building-card-title">
                  <Building2 size={18} className="icon-muted" />
                  <h4>{building.name || `Building ${buildingIndex + 1}`}</h4>
                  <span>{building.street} {building.house_number} ({buildingUnits.length} units)</span>
                </div>
                <div className="building-card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => { e.stopPropagation(); addUnit(building.tempId); }}
                  >
                    <Plus size={14} /> Add Unit
                  </button>
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
                            <th className="th-actions" />
                          </tr>
                        </thead>
                        <tbody>
                          {buildingUnits.map(unit => (
                            <tr key={unit.tempId}>
                              <td>
                                <input
                                  type="text"
                                  value={unit.unit_number}
                                  onChange={e => updateUnit(unit.tempId, 'unit_number', e.target.value)}
                                  placeholder="01"
                                  className="input-sm"
                                />
                              </td>
                              <td>
                                <select
                                  value={unit.type}
                                  onChange={e => updateUnit(unit.tempId, 'type', e.target.value)}
                                  className="input-md"
                                >
                                  {UNIT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={unit.floor}
                                  onChange={e => updateUnit(unit.tempId, 'floor', e.target.value)}
                                  placeholder="0"
                                  className="input-sm"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={unit.entrance}
                                  onChange={e => updateUnit(unit.tempId, 'entrance', e.target.value)}
                                  placeholder="A"
                                  className="input-sm"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={unit.size_sqm}
                                  onChange={e => updateUnit(unit.tempId, 'size_sqm', e.target.value)}
                                  placeholder="95"
                                  className="input-sm"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={unit.co_ownership_share}
                                  onChange={e => updateUnit(unit.tempId, 'co_ownership_share', e.target.value)}
                                  placeholder="11.0"
                                  className="input-sm"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={unit.construction_year}
                                  onChange={e => updateUnit(unit.tempId, 'construction_year', e.target.value)}
                                  placeholder="2023"
                                  className="input-sm"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={unit.rooms}
                                  onChange={e => updateUnit(unit.tempId, 'rooms', e.target.value)}
                                  placeholder="3"
                                  className="input-xs"
                                />
                              </td>
                              <td>
                                <div className="unit-actions">
                                  <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => duplicateUnit(unit)}
                                    title="Duplicate"
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-icon btn-danger"
                                    onClick={() => removeUnit(unit.tempId)}
                                    title="Remove"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-units">
                      <p>No units yet</p>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => addUnit(building.tempId)}
                      >
                        <Plus size={14} /> Add First Unit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-value">{buildings.length}</div>
            <div className="summary-stat-label">Buildings</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{unitCounts.total}</div>
            <div className="summary-stat-label">Total Units</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{unitCounts.apartments}</div>
            <div className="summary-stat-label">Apartments</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{unitCounts.offices}</div>
            <div className="summary-stat-label">Offices</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{unitCounts.parking}</div>
            <div className="summary-stat-label">Parking</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-with-back">
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2>Create Property</h2>
              <p>Set up a new property in your portfolio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="wizard-layout">
        {/* Sidebar */}
        <div className="wizard-sidebar">
          <div className="wizard-steps">
            {STEPS.map((step) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div
                  key={step.number}
                  className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => handleStepClick(step.number)}
                >
                  <div className="wizard-step-number">
                    {isCompleted ? <Check size={14} /> : step.number}
                  </div>
                  <div className="wizard-step-content">
                    <div className="wizard-step-title">{step.title}</div>
                    <div className="wizard-step-desc">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="wizard-content">
          {renderStepContent()}

          {/* Footer Navigation */}
          <div className="wizard-footer">
            <div>
              {currentStep > 1 && (
                <button className="btn btn-secondary" onClick={() => setCurrentStep(s => s - 1)}>
                  Back
                </button>
              )}
            </div>
            <div className="wizard-footer-right">
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Cancel
              </button>
              {currentStep < 3 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(s => s + 1)}
                  disabled={
                    (currentStep === 1 && !canProceedFromStep1) ||
                    (currentStep === 2 && !canProceedFromStep2)
                  }
                >
                  Continue
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={saving || units.length === 0}
                >
                  {saving ? 'Creating...' : 'Create Property'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
