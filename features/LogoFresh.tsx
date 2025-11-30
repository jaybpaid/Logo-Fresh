import React, { useState, useRef, useMemo, useEffect } from 'react';
import { generateLogoSpecs, editImage, generateSvgPreview } from '../services/geminiService';
import { Button } from '../components/ui/Button';
import { IconUpload, IconPalette, IconSpark, IconDownload, IconLayers } from '../components/Icons';
import { LogoFreshResponse, LogoVariation, Occasion } from '../types';
import { OCCASION_CATEGORIES, STYLES } from '../constants';
import { LogoBackgroundStudio } from './LogoBackgroundStudio';
import { fetchOccasions } from '../services/firestoreService';

type Mode = 'occasion' | 'style';
type ViewMode = 'vector' | 'raster';

export const LogoFresh: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [mode, setMode] = useState<Mode>('occasion');
  
  const [allOccasions, setAllOccasions] = useState<Occasion[]>([]);
  const [occasionsLoading, setOccasionsLoading] = useState(true);
  const [occasionsError, setOccasionsError] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('Featured');
  const [occasion, setOccasion] = useState('');
  
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Modern']);
  const [integrateElements, setIntegrateElements] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<LogoFreshResponse | null>(null);
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [previewSvgs, setPreviewSvgs] = useState<Record<string, string>>({});
  const [previewLoaders, setPreviewLoaders] = useState<Record<string, boolean>>({});
  const [viewModes, setViewModes] = useState<Record<string, ViewMode>>({});

  const [studioImage, setStudioImage] = useState<string | null>(null);
  const [studioTitle, setStudioTitle] = useState<string>("Logo");
  const [studioPalette, setStudioPalette] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadOccasions = async () => {
    try {
      setOccasionsLoading(true);
      setOccasionsError(false);
      const occasionsFromDb = await fetchOccasions();
      if (occasionsFromDb.length === 0) {
        setOccasionsError(true);
      } else {
        setAllOccasions(occasionsFromDb);
        const featuredOccasion = occasionsFromDb.find(o => o.category === 'Featured');
        if (featuredOccasion) {
            setOccasion(featuredOccasion.value);
        } else if (occasionsFromDb.length > 0) {
            setOccasion(occasionsFromDb[0].value);
        }
      }
    } catch (error) {
      console.error("Error fetching occasions:", error);
      setOccasionsError(true);
    } finally {
      setOccasionsLoading(false);
    }
  };

  useEffect(() => {
    const savedLogo = localStorage.getItem('gemini_user_logo');
    if (savedLogo) setSourceImage(savedLogo);
    loadOccasions();
  }, []);

  const filteredOccasions = useMemo(() => {
    return allOccasions.filter(o => {
        if (selectedCategory === 'Featured') return o.category === 'Featured';
        return o.category === selectedCategory;
    });
  }, [allOccasions, selectedCategory]);

  const nextMonthInfo = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const nextMonthIndex = (currentMonth + 1) % 12;
    const nextMonthDate = new Date(today.getFullYear(), nextMonthIndex, 1);
    const monthName = nextMonthDate.toLocaleString('default', { month: 'long' });
    const upcomingOccasions = allOccasions.filter(o => o.months.includes(nextMonthIndex));
    return { monthName, upcomingOccasions };
  }, [allOccasions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSourceImage(result);
        localStorage.setItem('gemini_user_logo', result);
        const event = new CustomEvent('logo-updated', { detail: result });
        window.dispatchEvent(event);
        setResponse(null);
        setPreviewImages({});
        setPreviewSvgs({});
        setViewModes({});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;
    setIsLoading(true);
    setResponse(null);
    setPreviewImages({});
    setPreviewSvgs({});
    setPreviewLoaders({});
    setViewModes({});

    try {
      const params = {
        mode: mode,
        occasion: mode === 'occasion' ? allOccasions.find(o => o.value === occasion) : undefined,
        style: mode === 'style' ? { styleTags: selectedStyles } : undefined,
        integrateElements: mode === 'occasion' ? integrateElements : false,
      };
      const result = await generateLogoSpecs(sourceImage, params, imageMimeType);
      setResponse(result);
    } catch (error) {
      console.error("Failed to generate specs:", error);
      alert("Sorry, something went wrong while generating the ideas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVisualizeSingle = async (variation: LogoVariation) => {
    if (!sourceImage) return;

    setPreviewLoaders(prev => ({ ...prev, [variation.id]: true }));

    try {
        const rasterPrompt = `
            Generate a high-quality visualization of this logo variation: '${variation.title}'.
            Description: ${variation.rationale}.
            Palette: ${variation.palette.hex.join(', ')}.
            CRITICAL: PRESERVE BRAND SILHOUETTE. Add thematic elements AROUND the logo or in the background/negative space. Do not alter the core shape of the logo.
            Output a PNG on a solid white background.
        `;
        
        // Generate PNG and SVG in parallel
        const [pngResult, svgResult] = await Promise.all([
            editImage(sourceImage, rasterPrompt, imageMimeType),
            generateSvgPreview(sourceImage, variation)
        ]);
        
        setPreviewImages(prev => ({ ...prev, [variation.id]: pngResult }));
        setPreviewSvgs(prev => ({ ...prev, [variation.id]: svgResult }));
        setViewModes(prev => ({ ...prev, [variation.id]: 'raster' }));

    } catch (error) {
        console.error(`PNG/SVG generation failed for ${variation.id}`, error);
        alert(`Sorry, the visualization for "${variation.title}" failed. Please try again.`);
    } finally {
        setPreviewLoaders(prev => ({ ...prev, [variation.id]: false }));
    }
  };
  
  const handleDownload = (format: 'svg' | 'png', variationId: string) => {
     const data = format === 'svg' ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvgs[variationId])}` : previewImages[variationId];
     const link = document.createElement('a');
     link.href = data;
     link.download = `logofresh-${variationId}.${format}`;
     link.click();
  };


  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-center p-8">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-electric-blue animate-pulse-glow flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-white">hourglass_top</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mt-6 drop-shadow-lg">Loading Occasions...</h3>
      <p className="text-gray-400 mt-2">Connecting to the creative universe...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-center p-8 animate-fade-in">
      <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
      </div>
      <h3 className="text-xl font-bold text-white mt-6">Occasion Library is Empty</h3>
      <p className="text-gray-400 mt-2 max-w-md">The app's content needs to be initialized. Please go to your Profile page and use the Admin Tools to seed the database.</p>
      <Button onClick={loadOccasions} className="mt-8" variant="primary">
        Try Reloading
      </Button>
    </div>
  );
  
  if (occasionsLoading) return renderLoadingState();
  if (occasionsError) return renderEmptyState();

  return (
    <div className="flex flex-col md:flex-row h-full">
      {studioImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 animate-fade-in">
          <LogoBackgroundStudio 
            src={studioImage} 
            title={studioTitle}
            brandSwatches={studioPalette}
            onClose={() => setStudioImage(null)} 
          />
        </div>
      )}

      {/* Left Panel: Configuration */}
      <div className="w-full md:w-[400px] bg-[#0A0A10] p-6 border-r border-white/5 flex-shrink-0 custom-scrollbar overflow-y-auto">
        <div className="space-y-10">

          {/* 1. Base Logo */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Base Logo</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              {sourceImage ? (
                <>
                  <img src={sourceImage} alt="Uploaded Logo" className="max-w-full max-h-full object-contain rounded-lg"/>
                  <button onClick={(e) => { e.stopPropagation(); setSourceImage(null); localStorage.removeItem('gemini_user_logo'); }} className="absolute top-2 right-2 text-xs bg-red-500/80 text-white px-2 py-1 rounded-md font-bold">Remove</button>
                </>
              ) : (
                <>
                  <IconUpload className="w-10 h-10 text-gray-500 mb-2"/>
                  <span className="text-sm font-medium text-gray-300">Click to upload SVG or PNG</span>
                  <span className="text-xs text-gray-500">Vector preferred. Up to 5MB.</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/svg+xml, image/webp" className="hidden" />
          </div>

          {/* 2. Subscription CTA */}
           <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#191934] to-[#101122] border border-white/10 overflow-hidden shadow-card-float">
               <div className="absolute -right-10 -top-10 text-primary/10">
                   <IconSpark className="w-32 h-32 transform rotate-12"/>
               </div>
               <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-electric-green shadow-[0_0_8px_#39FF14]"></span>
                    <p className="text-xs font-bold text-electric-green uppercase tracking-wide">Automate Monthly</p>
                  </div>
                   <p className="text-white font-bold text-lg mt-2">Next: {nextMonthInfo.monthName} Pack</p>
                   <div className="flex flex-wrap gap-1.5 mt-3">
                     {nextMonthInfo.upcomingOccasions.slice(0, 2).map(o => (
                       <span key={o.value} className="text-xs bg-white/10 px-2 py-1 rounded-md">{o.label}</span>
                     ))}
                     {nextMonthInfo.upcomingOccasions.length > 2 && <span className="text-xs bg-black/20 px-2 py-1 rounded-md">+ {nextMonthInfo.upcomingOccasions.length - 2} more</span>}
                   </div>
                   <Button onClick={() => setIsSubscribed(!isSubscribed)} className="w-full mt-6 h-12" variant={isSubscribed ? 'secondary' : 'primary'}>
                     {isSubscribed ? 'Subscribed!' : 'Enable Auto-Send ($29/mo)'}
                   </Button>
               </div>
           </div>

          {/* 3. Configuration */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Configuration</h3>
            <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-xl">
              <button onClick={() => setMode('occasion')} className={`py-3 text-sm font-bold rounded-lg transition-colors ${mode === 'occasion' ? 'bg-primary text-white shadow-glow-primary' : 'text-gray-400 hover:bg-white/10'}`}>Occasion</button>
              <button onClick={() => setMode('style')} className={`py-3 text-sm font-bold rounded-lg transition-colors ${mode === 'style' ? 'bg-primary text-white shadow-glow-primary' : 'text-gray-400 hover:bg-white/10'}`}>Style Refresh</button>
            </div>
            
            {mode === 'occasion' ? (
              <div className="space-y-4">
                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-gradient">
                    {OCCASION_CATEGORIES.map(cat => (
                       <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-electric-blue text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                          {cat}
                       </button>
                    ))}
                 </div>
                 <div className="space-y-3 h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredOccasions.map(o => (
                       <button key={o.value} onClick={() => setOccasion(o.value)} className={`group relative w-full h-20 rounded-xl overflow-hidden text-left p-4 border-2 transition-all ${occasion === o.value ? 'border-electric-blue shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'border-transparent hover:border-white/20'}`}>
                          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80" style={{backgroundImage: `url(${o.imageUrl})`}}/>
                          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"/>
                          <div className="relative">
                             <p className="font-bold text-white drop-shadow-md">{o.label}</p>
                             <p className="text-xs text-gray-300 drop-shadow-sm">{o.tone} Tone</p>
                          </div>
                       </button>
                    ))}
                 </div>
                 <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={integrateElements} onChange={e => setIntegrateElements(e.target.checked)} className="w-5 h-5 rounded border-gray-500 text-primary focus:ring-primary bg-transparent"/>
                    <span className="text-sm text-gray-300 font-medium">Integrate Thematic Elements</span>
                 </label>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Select one or more styles to apply.</p>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => setSelectedStyles(prev => prev.includes(s) ? prev.filter(ps => ps !== s) : [...prev, s])} className={`px-4 py-2 text-xs font-bold rounded-full transition-colors ${selectedStyles.includes(s) ? 'bg-electric-blue text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button onClick={handleGenerate} isLoading={isLoading} disabled={!sourceImage || isLoading} className="w-full h-16 text-lg" variant="neon">
            <IconSpark className="w-6 h-6 mr-3"/>
            Generate Variations
          </Button>
        </div>
      </div>

      {/* Right Panel: Results */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar">
        {!response && !isLoading && (
           <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative mb-8 w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                  <IconPalette className="w-24 h-24 text-primary/50"/>
              </div>
              <h3 className="text-xl font-bold text-white">Your variations will appear here</h3>
              <p className="text-gray-500 mt-2 max-w-sm">Upload your logo and configure your desired occasion or style to start generating.</p>
           </div>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 animate-spin rounded-full border-4 border-dashed border-primary mb-6"></div>
                <h3 className="text-xl font-bold text-white">Generating Ideas...</h3>
                <p className="text-gray-400 mt-2">The AI is warming up. This might take a moment.</p>
            </div>
        )}

        {response && (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white tracking-tight">Variations</h2>
              <Button variant="secondary"><IconDownload className="w-4 h-4 mr-2"/> Download All</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {(response.variations || []).map(v => {
                 const isGenerated = previewImages[v.id];
                 const isGenerating = previewLoaders[v.id];
                 
                 return (
                    <div key={v.id} className="space-y-4 animate-fade-in">
                       <div className="relative aspect-square w-full rounded-2xl bg-[#1A1A2E]/50 border border-white/10 flex items-center justify-center p-4 shadow-card-float">
                          {isGenerating && (
                            <div className="flex flex-col items-center text-center">
                               <div className="w-12 h-12 animate-spin rounded-full border-4 border-dashed border-primary"></div>
                               <p className="text-xs text-gray-400 mt-4">Visualizing...</p>
                            </div>
                          )}
                          {isGenerated && (
                            <img src={previewImages[v.id]} alt={v.title} className="max-w-full max-h-full object-contain"/>
                          )}
                          {!isGenerated && !isGenerating && (
                            <Button onClick={() => handleVisualizeSingle(v)}>
                               <IconSpark className="w-4 h-4 mr-2"/>
                               Generate
                            </Button>
                          )}
                       </div>
                       <div className="px-2">
                          <div className="flex items-start justify-between">
                             <h4 className="font-bold text-white">{v.title}</h4>
                             {isGenerated && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => { setStudioImage(previewImages[v.id]); setStudioTitle(v.title); setStudioPalette(v.palette.hex); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors"><IconLayers className="w-4 h-4"/></button>
                                  <button onClick={() => handleDownload('png', v.id)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors"><IconDownload className="w-4 h-4"/></button>
                                  {previewSvgs[v.id] && <button onClick={() => handleDownload('svg', v.id)} className="p-1.5 rounded-full bg-electric-blue/20 text-electric-blue hover:bg-electric-blue/30 transition-colors">SVG</button>}
                                </div>
                             )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{v.rationale}</p>
                          <div className="flex items-center gap-2 mt-3">
                             {v.palette.hex.map(hex => <div key={hex} style={{backgroundColor: hex}} className="w-4 h-4 rounded-full border-2 border-white/10"/>)}
                          </div>
                       </div>
                    </div>
                 )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
