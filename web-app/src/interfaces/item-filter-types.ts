export enum SearchTag {
  NAME,
  DISPLAY_NAME,
  LORE,
  ENCHANTMENTS,
  TAGS,
}

export enum SystemDisplayMode {
  LIST,
  INVENTORY,
}

export enum SortMode {
  NAME,
  COUNT,
  DISPLAY_NAME,
}

export enum SortDirection {
  ASC,
  DESC,
}

export interface FilterInfo {
  search: string;
  regexMode: boolean;
  searchTags: Set<SearchTag>;
  sortMode: SortMode;
  sortDirection: SortDirection;
}
