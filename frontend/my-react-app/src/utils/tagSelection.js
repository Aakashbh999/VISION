export const toggleCappedSelection = (selectedItems, item, cap) => {
  const alreadySelected = selectedItems.includes(item);
  if (alreadySelected) {
    return selectedItems.filter((value) => value !== item);
  }
  if (selectedItems.length >= cap) {
    return selectedItems;
  }
  return [...selectedItems, item];
};

export const addUniqueCappedTag = (tags, rawTag, cap) => {
  const normalizedTag = rawTag.trim();
  if (!normalizedTag || tags.length >= cap) {
    return tags;
  }

  const hasDuplicate = tags
    .map((tag) => tag.toLowerCase())
    .includes(normalizedTag.toLowerCase());
  if (hasDuplicate) {
    return tags;
  }

  return [...tags, normalizedTag];
};

export const removeTag = (tags, tagToRemove) =>
  tags.filter((tag) => tag !== tagToRemove);
