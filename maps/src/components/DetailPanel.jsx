import { useState } from 'react';
import { X, Bed, Bath, Maximize2, Building2, MapPin, Users, DollarSign, Calendar, ExternalLink, TrendingUp } from 'lucide-react';
import { formatPrice } from '../services/api';

const GMAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function DetailPanel({ property, neighborhood, onClose }) {
  const [imgError, setImgError] = useState(false);

  if (!property) return null;

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${property.lat},${property.lng}&heading=0&pitch=0&fov=90&key=${GMAP_API_KEY}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`;
  const photo = property.photos?.[0];
  const heroImg = photo && !imgError ? photo : streetViewUrl;

  return (
    <div
      className="absolute top-0 right-0 bottom-0 w-[380px] bg-white z-20 flex flex-col overflow-hidden rounded-r-xl"
      style={{
        animation: 'slideInRight 0.25s ease-out',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
      }}
    >
      {/* Hero image */}
      <div className="relative h-52 bg-slate-100 flex-none">
        <img
          src={heroImg}
          alt={property.address}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-sm"
        >
          <X size={16} className="text-slate-700" />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-lg">
            {formatPrice(property.price)}/mo
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Address */}
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-base font-bold text-slate-900 leading-tight">{property.address}</h2>
          <p className="text-xs text-slate-500 mt-1">{property.propertyType} &middot; Rental</p>
        </div>

        {/* Quick stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {property.bedrooms != null && (
              <div className="flex flex-col items-center py-2.5 rounded-lg bg-sky-50 border border-sky-100">
                <Bed size={16} className="text-sky-500 mb-1" />
                <span className="text-sm font-bold text-slate-800">{property.bedrooms}</span>
                <span className="text-[10px] text-slate-500">Beds</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex flex-col items-center py-2.5 rounded-lg bg-sky-50 border border-sky-100">
                <Bath size={16} className="text-sky-500 mb-1" />
                <span className="text-sm font-bold text-slate-800">{property.bathrooms}</span>
                <span className="text-[10px] text-slate-500">Baths</span>
              </div>
            )}
            {property.sqft != null && (
              <div className="flex flex-col items-center py-2.5 rounded-lg bg-sky-50 border border-sky-100">
                <Maximize2 size={16} className="text-sky-500 mb-1" />
                <span className="text-sm font-bold text-slate-800">{property.sqft.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500">Sq Ft</span>
              </div>
            )}
          </div>
        </div>

        {/* Property details from RentCast */}
        <div className="px-4 py-3 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Building2 size={12} /> Property Details
          </h3>
          <div className="space-y-2">
            <DetailRow icon={<DollarSign size={13} />} label="Monthly Rent" value={property.price != null ? `$${property.price.toLocaleString()}` : '—'} highlight />
            <DetailRow icon={<Maximize2 size={13} />} label="Size" value={property.sqft != null ? `${property.sqft.toLocaleString()} sqft` : '—'} />
            {property.sqft && property.price && (
              <DetailRow icon={<TrendingUp size={13} />} label="Price / sqft" value={`$${(property.price / property.sqft).toFixed(2)}/sqft`} />
            )}
            <DetailRow icon={<Building2 size={13} />} label="Type" value={property.propertyType || '—'} />
          </div>
        </div>

        {/* Neighborhood data from NYC Open Data */}
        {neighborhood && (
          <div className="px-4 py-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <MapPin size={12} /> Neighborhood
            </h3>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 mb-2.5">
              <p className="text-sm font-semibold text-emerald-800">{neighborhood.ntaname}</p>
              <p className="text-xs text-emerald-600">{neighborhood.boroname}</p>
            </div>
            <div className="space-y-2">
              {neighborhood.population > 0 && (
                <DetailRow icon={<Users size={13} />} label="Population" value={neighborhood.population.toLocaleString()} />
              )}
              {neighborhood.medianAge > 0 && (
                <DetailRow icon={<Calendar size={13} />} label="Median Age" value={neighborhood.medianAge.toFixed(1)} />
              )}
              {neighborhood.income > 0 && (
                <DetailRow icon={<DollarSign size={13} />} label="Median Income" value={`$${neighborhood.income.toLocaleString()}`} />
              )}
            </div>
          </div>
        )}

        {/* Google Maps link */}
        <div className="px-4 py-3 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <MapPin size={12} /> Location
          </h3>
          <div className="text-xs text-slate-500 mb-2">
            {property.lat.toFixed(5)}, {property.lng.toFixed(5)}
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 border border-sky-200 text-sm font-medium text-sky-600 hover:bg-sky-100 transition-colors"
          >
            <ExternalLink size={13} /> View on Google Maps
          </a>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-slate-500">
        {icon} {label}
      </span>
      <span className={highlight ? 'font-bold text-emerald-600' : 'font-medium text-slate-800'}>
        {value}
      </span>
    </div>
  );
}
