export enum SearchTag {
  NAME = 'Name',
  DISPLAY_NAME = 'Display Name',
  LORE = 'Lore',
  ENCHANTMENTS = 'Enchantments',
  TAGS = 'Tags',
}

export enum SystemDisplayMode {
  LIST,
  INVENTORY,
}

export enum SortMode {
  NAME = 'Name',
  COUNT = 'Count',
  DISPLAY_NAME = 'Display Name',
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
