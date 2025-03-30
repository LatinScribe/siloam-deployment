export function getFileExtension(filename) {
    const match = filename.match(/\.([^\.]+)$/);
    return match ? match[1] : '';
}