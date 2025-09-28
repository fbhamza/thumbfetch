
export const THUMBNAIL_QUALITIES = [
    { quality: 'maxresdefault', label: 'Max Resolution', resolution: '1280x720' },
    { quality: 'sddefault', label: 'HD', resolution: '640x480' },
    { quality: 'hqdefault', label: 'High Quality', resolution: '480x360' },
    { quality: 'mqdefault', label: 'Medium Quality', resolution: '320x180' },
    { quality: 'default', label: 'Default', resolution: '120x90' },
];

export const getThumbnailUrl = (videoId: string, quality: string): string => `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
