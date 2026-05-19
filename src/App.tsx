import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LinkViewer from './components/LinkViewer';
import SiswaMasterForm from './components/SiswaMasterForm';
import AgendaBKForm from './components/AgendaBKForm';
import { SavedLink } from './types';
import { DEFAULT_LINKS, CATEGORIES } from './data/defaultLinks';

export default function App() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

  // Load links on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nusa_dock_links');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLinks(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading links from localStorage', e);
    }
    // Fallback to default presets
    setLinks(DEFAULT_LINKS);
  }, []);

  // Save links whenever state changes
  const saveLinks = (updatedLinks: SavedLink[]) => {
    setLinks(updatedLinks);
    try {
      localStorage.setItem('nusa_dock_links', JSON.stringify(updatedLinks));
    } catch (e) {
      console.error('Error saving links to local storage', e);
    }
  };

  // Select link
  const handleSelectLink = (id: string) => {
    setActiveLinkId(id);
  };

  // Add a new custom user link
  const handleAddLink = (newLinkData: Omit<SavedLink, 'id'>) => {
    const newLink: SavedLink = {
      ...newLinkData,
      id: Date.now().toString()
    };
    const updated = [...links, newLink];
    saveLinks(updated);
  };

  // Delete an existing user link
  const handleDeleteLink = (id: string) => {
    const updated = links.filter((link) => link.id !== id);
    saveLinks(updated);
    if (activeLinkId === id) {
      setActiveLinkId(null);
    }
  };

  // Import dynamic set of links from backup JSON file
  const handleImportLinks = (importedLinks: SavedLink[]) => {
    // Generate fresh robust ids for imported links to avoid collisions
    const formatted: SavedLink[] = importedLinks.map((link, idx) => ({
      ...link,
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`
    }));
    saveLinks(formatted);
    setActiveLinkId(null);
  };

  // Get current active link object
  const activeLink = links.find((link) => link.id === activeLinkId) || null;

  // Track unique categories in saved links to feed filter options
  const uniqueCategories = Array.from(
    new Set([
      'Semua',
      ...CATEGORIES.filter(c => c !== 'Semua'),
      ...links.map((l) => l.category)
    ])
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-50 text-zinc-800" id="main-application-frame">
      {/* Sidebar Panel */}
      <Sidebar 
        links={links}
        categories={uniqueCategories}
        activeLinkId={activeLinkId}
        onSelectLink={handleSelectLink}
        onAddLink={handleAddLink}
        onDeleteLink={handleDeleteLink}
        onImportLinks={handleImportLinks}
      />

      {/* Main Viewport Panel */}
      {activeLinkId === 'siswa-master' ? (
        <SiswaMasterForm onBack={() => setActiveLinkId(null)} />
      ) : activeLinkId === 'agenda-bk' ? (
        <AgendaBKForm onBack={() => setActiveLinkId(null)} />
      ) : (
        <LinkViewer 
          activeLink={activeLink}
          totalLinksCount={links.length}
          totalCategoriesCount={uniqueCategories.length - 1} // minus 'Semua'
        />
      )}
    </div>
  );
}
