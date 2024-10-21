import { Markdown } from './markdown.jsx';

// Ensure the bundle global object exists
const bundle = typeof window.bundle !== 'undefined' ? window.bundle : {};
// Create helpers namespace
bundle.helpers = bundle.helpers || {};

// Add widgets to helpers namespace of the bundle object
bundle.helpers.Markdown = Markdown;
