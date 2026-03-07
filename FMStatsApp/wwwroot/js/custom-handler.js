'use strict';

// Array för att hålla reda på valda ID:n
let selectedItems = [];

/**
 * Hanterar klick på valbara element.
 * Lägger till eller tar bort ID från `selectedItems` och uppdaterar visuell markering.
 */
function handleItemClick(event) {
    const btn = event.currentTarget;
    const selectedItemId = btn.dataset.seidoSelectedItemId;

    if (!selectedItemId) return; // Kontrollera att ID finns

    if (selectedItems.includes(selectedItemId)) {
        // Ta bort ID om det redan är valt
        selectedItems = selectedItems.filter(id => id !== selectedItemId);
        btn.classList.remove('selected'); // Ta bort visuell markering
    } else {
        // Lägg till ID om det inte redan är valt
        selectedItems.push(selectedItemId);
        btn.classList.add('selected'); // Lägg till visuell markering
    }

    console.log('Selected Items:', selectedItems);
}