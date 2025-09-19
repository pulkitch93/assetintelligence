import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'range' | 'text';
  options?: string[];
  defaultValue?: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  onFiltersChange: (filters: Record<string, any>) => void;
  searchPlaceholder?: string;
}

export const FilterBar = ({ 
  filters, 
  onFiltersChange, 
  searchPlaceholder = "Search assets..." 
}: FilterBarProps) => {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...appliedFilters, [key]: value };
    setAppliedFilters(newFilters);
    onFiltersChange({ ...newFilters, search: searchTerm });
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[key];
    setAppliedFilters(newFilters);
    onFiltersChange({ ...newFilters, search: searchTerm });
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
    setSearchTerm("");
    onFiltersChange({});
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...appliedFilters, search: value });
  };

  const activeFilterCount = Object.keys(appliedFilters).length;

  return (
    <div className="border-b border-border bg-card p-4">
      <div className="flex items-center justify-between space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <Label htmlFor={filter.key}>{filter.label}</Label>
                  {filter.type === 'select' && (
                    <Select
                      value={appliedFilters[filter.key] || ""}
                      onValueChange={(value) => handleFilterChange(filter.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === 'text' && (
                    <Input
                      id={filter.key}
                      value={appliedFilters[filter.key] || ""}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={`Enter ${filter.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(appliedFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            return (
              <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                <span>{filter?.label}: {value}</span>
                <button
                  onClick={() => removeFilter(key)}
                  className="ml-1 hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};