"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getAllCountries,
  resolveCountryCode,
  validatePhoneNumber,
  CountryInfo,
} from "@/lib/phone-validation";
import parsePhoneNumberFromString, {
  AsYouType,
  CountryCode,
  getCountryCallingCode,
} from "libphonenumber-js";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (
    value: string,
    meta?: {
      isValid: boolean;
      country: CountryCode;
      e164?: string;
      nationalNumber?: string;
    }
  ) => void;
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  error?: string | null;
}

// Sample placeholder guide by country
const COUNTRY_PLACEHOLDERS: Record<string, string> = {
  LK: "77 123 4567",
  US: "(555) 000-0000",
  CA: "(555) 000-0000",
  GB: "7911 123456",
  IN: "98765 43210",
  AU: "412 345 678",
  DE: "151 23456789",
  FR: "6 12 34 56 78",
  JP: "90-1234-5678",
  SG: "8123 4567",
  AE: "50 123 4567",
};

/**
 * Robust national number formatter with live auto-spacing.
 */
export function formatNationalInput(digitsOnly: string, country: CountryCode = "LK"): string {
  if (!digitsOnly) return "";

  // Specialized formatting for Sri Lanka
  if (country === "LK") {
    let clean = digitsOnly.replace(/\D/g, "");
    if (clean.startsWith("94") && clean.length > 9) clean = clean.slice(2);
    if (clean.startsWith("0")) {
      // e.g. 077 123 4567
      if (clean.length <= 3) return clean;
      if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
      return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 10)}`;
    } else {
      // e.g. 77 123 4567
      if (clean.length <= 2) return clean;
      if (clean.length <= 5) return `${clean.slice(0, 2)} ${clean.slice(2)}`;
      return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 9)}`;
    }
  }

  // Use AsYouType for all other international countries
  const clean = digitsOnly.replace(/[^\d+]/g, "");
  const formatter = new AsYouType(country);
  return formatter.input(clean);
}

/**
 * Extract national/local display digits from a full or partial phone string
 */
function extractDisplayNumber(rawPhone: string, country: CountryCode): string {
  if (!rawPhone) return "";
  const trimmed = rawPhone.trim();

  // If already parsed with libphonenumber-js
  if (trimmed.startsWith("+")) {
    try {
      const parsed = parsePhoneNumberFromString(trimmed);
      if (parsed) {
        if (parsed.country === "LK") {
          return formatNationalInput(parsed.nationalNumber, "LK");
        }
        return parsed.formatNational().replace(/^[0()\- ]+/, "") || parsed.nationalNumber;
      }
    } catch {
      // Fallback
    }
  }

  // Remove country code if present at beginning
  try {
    const callingCode = getCountryCallingCode(country);
    if (trimmed.startsWith(`+${callingCode}`)) {
      return formatNationalInput(trimmed.slice(callingCode.length + 1).trim(), country);
    }
  } catch {
    // Ignore
  }

  return formatNationalInput(trimmed, country);
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "LK",
  placeholder,
  disabled = false,
  required = false,
  className,
  id = "phone-input",
  name = "phone",
  error,
}: PhoneInputProps) {
  const allCountries = useMemo(() => getAllCountries(), []);
  const initialCountryCode = useMemo(() => resolveCountryCode(defaultCountry), [defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountryCode);
  const [displayValue, setDisplayValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync country code if defaultCountry prop changes
  useEffect(() => {
    const code = resolveCountryCode(defaultCountry);
    setSelectedCountry(code);
  }, [defaultCountry]);

  // Sync display value when incoming value prop changes externally
  useEffect(() => {
    if (!value) {
      setDisplayValue("");
      return;
    }

    // Check if value includes international prefix
    if (value.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed?.country && parsed.country !== selectedCountry) {
        setSelectedCountry(parsed.country);
        setDisplayValue(extractDisplayNumber(value, parsed.country));
        return;
      }
    }

    setDisplayValue(extractDisplayNumber(value, selectedCountry));
  }, [value, selectedCountry]);

  // Current selected country metadata
  const currentCountryInfo = useMemo(() => {
    return (
      allCountries.find((c) => c.code === selectedCountry) || {
        code: selectedCountry,
        name: "Sri Lanka",
        callingCode: "+94",
        flag: "🇱🇰",
      }
    );
  }, [allCountries, selectedCountry]);

  // Filter countries in search dropdown
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return allCountries;
    const q = searchQuery.toLowerCase().trim();
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.callingCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [allCountries, searchQuery]);

  // Handle phone input change with live auto-spacing & formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // If pasted full international number with '+'
    if (raw.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(raw);
      let targetCountry = selectedCountry;
      if (parsed?.country) {
        targetCountry = parsed.country;
        setSelectedCountry(parsed.country);
      }

      const formattedLocal = extractDisplayNumber(raw, targetCountry);
      setDisplayValue(formattedLocal);

      const validation = validatePhoneNumber(raw, targetCountry);
      const fullValue = validation.formatted || raw;

      onChange(fullValue, {
        isValid: validation.isValid,
        country: targetCountry,
        e164: validation.e164,
        nationalNumber: validation.nationalNumber,
      });
      return;
    }

    // Clean digits and format with auto-spacing
    const formatted = formatNationalInput(raw, selectedCountry);
    setDisplayValue(formatted);

    const callingCode = currentCountryInfo.callingCode;
    const fullNumber = formatted ? `${callingCode} ${formatted}`.trim() : "";

    const validation = fullNumber
      ? validatePhoneNumber(fullNumber, selectedCountry)
      : { isValid: false, formatted: "", e164: "" };

    onChange(fullNumber, {
      isValid: validation.isValid,
      country: selectedCountry,
      e164: validation.e164,
      nationalNumber: validation.nationalNumber,
    });
  };

  const handleSelectCountry = (country: CountryInfo) => {
    setSelectedCountry(country.code);
    setIsOpen(false);
    setSearchQuery("");

    // Re-format existing display value with newly selected country
    if (displayValue.trim()) {
      const formatted = formatNationalInput(displayValue, country.code);
      setDisplayValue(formatted);
      const fullNumber = `${country.callingCode} ${formatted}`.trim();
      const validation = validatePhoneNumber(fullNumber, country.code);
      onChange(fullNumber, {
        isValid: validation.isValid,
        country: country.code,
        e164: validation.e164,
        nationalNumber: validation.nationalNumber,
      });
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const activePlaceholder =
    placeholder || COUNTRY_PLACEHOLDERS[selectedCountry] || "123 456 7890";

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Stripe-like Unified Phone Input Container */}
      <div
        className={cn(
          "relative flex items-center h-11 w-full rounded-md border border-input bg-background transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:border-primary",
          error && "border-destructive focus-within:ring-destructive",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Country Selector Dropdown Trigger */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center h-full px-3 border-r border-border hover:bg-muted/50 transition-colors text-xs font-sans select-none rounded-l-md shrink-0",
                "focus:outline-none focus-visible:bg-muted"
              )}
              aria-label="Select Country"
            >
              <span className="font-mono text-xs font-semibold text-foreground">
                {currentCountryInfo.callingCode}
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-72 p-0 border border-border bg-popover shadow-xl rounded-lg z-50"
          >
            {/* Search Country */}
            <div className="p-2 border-b border-border">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search country or dial code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs font-sans bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  autoFocus
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-60 overflow-y-auto p-1 divide-y divide-border/20 text-xs">
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No country found.
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = country.code === selectedCountry;
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelectCountry(country)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="truncate font-sans">{country.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {country.callingCode}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Local Phone Number Input with Auto-Spacing */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={activePlaceholder}
          disabled={disabled}
          required={required}
          autoComplete="tel"
          className={cn(
            "flex-1 h-full px-3 text-xs font-sans bg-transparent placeholder:text-muted-foreground/60 text-foreground",
            "focus:outline-none disabled:cursor-not-allowed"
          )}
        />
      </div>

      {error && (
        <p className="text-[11px] font-sans text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  );
}
