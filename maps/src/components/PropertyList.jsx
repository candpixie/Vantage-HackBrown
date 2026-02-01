import { Building2, MapPin, Maximize2, Bed, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { formatPrice } from '../services/api';

export default function PropertyList({ listings, selectedId, onSelect }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });

  return (
    <section className="bg-white border-t border-slate-200 relative">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Available Rentals</h2>
        <div className="flex gap-1">
          <button onClick={() => scroll(-1)} className="rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll(1)} className="rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 pb-3 pt-1" style={{ scrollbarWidth: 'none' }}>
        {listings.length === 0 && (
          <div className="flex-none w-full flex items-center justify-center py-6">
            <p className="text-slate-400 text-sm">No listings available</p>
          </div>
        )}
        {listings.map((listing) => (
          <PropertyCard key={listing.id} listing={listing} isSelected={listing.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function PropertyCard({ listing, isSelected, onSelect }) {
  const photo = listing.photos?.[0] ?? null;

  return (
    <button
      onClick={() => onSelect(listing)}
      className={`flex-none w-64 rounded-xl overflow-hidden border transition-all cursor-pointer group text-left ${
        isSelected
          ? 'border-sky-400 ring-2 ring-sky-200 shadow-lg shadow-sky-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      } bg-white`}
    >
      <div className="h-24 bg-slate-100 relative overflow-hidden">
        {photo ? (
          <img src={photo} alt={listing.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50">
            <Building2 size={24} className="text-slate-300" />
          </div>
        )}
        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-slate-700 shadow-sm">
          {listing.propertyType}
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-xs font-semibold text-slate-800 truncate">{listing.address}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
          {listing.price != null && <span className="text-emerald-600 font-bold">{formatPrice(listing.price)}/mo</span>}
          {listing.bedrooms != null && (
            <span className="flex items-center gap-0.5">
              <Bed size={9} />
              {listing.bedrooms} bd
            </span>
          )}
          {listing.sqft != null && (
            <span className="flex items-center gap-0.5">
              <Maximize2 size={9} />
              {listing.sqft.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
          <MapPin size={9} />
          <span className="truncate">Rental</span>
        </div>
      </div>
    </button>
  );
}
