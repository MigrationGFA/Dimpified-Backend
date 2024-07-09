// Disable zooming
document.addEventListener('touchmove', function(event) {
    if (event.scale !== 1) { event.preventDefault(); }
}, { passive: false });

// Disable pinch to zoom
document.addEventListener('gesturestart', function(event) {
    event.preventDefault();
});

// Disable right-click
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});
