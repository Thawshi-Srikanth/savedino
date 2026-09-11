/**
 * Robust International Phone & WhatsApp Number Validation & Formatting
 * Powered by libphonenumber-js with default Sri Lanka (LK) preference.
 */

import parsePhoneNumberFromString, {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  AsYouType,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "libphonenumber-js";

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
  e164?: string;
  country?: CountryCode;
  nationalNumber?: string;
}

export interface CountryInfo {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
}

// Convert 2-letter ISO code to flag emoji
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Cache region names formatter
const regionNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function getCountryName(countryCode: string): string {
  try {
    return regionNames?.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

// Map of common country names / aliases to CountryCode
const COUNTRY_NAME_TO_CODE: Record<string, CountryCode> = {
  "sri lanka": "LK",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  india: "IN",
  australia: "AU",
  canada: "CA",
  germany: "DE",
  japan: "JP",
  france: "FR",
  singapore: "SG",
  malaysia: "MY",
  "united arab emirates": "AE",
  uae: "AE",
  "saudi arabia": "SA",
  "new zealand": "NZ",
};

export function resolveCountryCode(countryOrCode?: string | null): CountryCode {
  if (!countryOrCode) return "LK";
  const upper = countryOrCode.trim().toUpperCase();
  if (upper.length === 2 && getCountries().includes(upper as CountryCode)) {
    return upper as CountryCode;
  }
  const lower = countryOrCode.trim().toLowerCase();
  if (COUNTRY_NAME_TO_CODE[lower]) {
    return COUNTRY_NAME_TO_CODE[lower];
  }
  return "LK";
}

// Get sorted list of all supported countries with metadata
export function getAllCountries(): CountryInfo[] {
  const codes = getCountries();
  const list: CountryInfo[] = codes.map((code) => {
    let callingCode = "";
    try {
      callingCode = getCountryCallingCode(code);
    } catch {
      callingCode = "";
    }
    return {
      code,
      name: getCountryName(code),
      callingCode: `+${callingCode}`,
      flag: getCountryFlag(code),
    };
  });

  // Sort alphabetically by country name, but put Sri Lanka (LK) and key countries at top
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

/**
 * Validate and format any phone number worldwide.
 */
export function validatePhoneNumber(
  rawPhone: string,
  defaultCountry: string = "LK"
): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== "string" || rawPhone.trim().length === 0) {
    return {
      isValid: false,
      error: "Phone number is required.",
    };
  }

  const trimmed = rawPhone.trim();

  // Disallow invalid characters
  const allowedCharsRegex = /^[\d\s+\-()]+$/;
  if (!allowedCharsRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Phone number contains invalid characters.",
    };
  }

  const countryCode = resolveCountryCode(defaultCountry);

  try {
    // Try parsing with libphonenumber-js
    let phoneNumber = parsePhoneNumberFromString(trimmed, countryCode);

    // If initial parse fails and no leading plus, try with leading plus or default country
    if (!phoneNumber && !trimmed.startsWith("+")) {
      phoneNumber = parsePhoneNumberFromString(`+${trimmed}`, countryCode);
    }

    if (!phoneNumber) {
      return {
        isValid: false,
        error: "Please enter a valid phone number with country code.",
      };
    }

    if (!phoneNumber.isValid()) {
      const countryName = getCountryName(phoneNumber.country || countryCode);
      return {
        isValid: false,
        error: `Please enter a valid phone number for ${countryName}.`,
      };
    }

    return {
      isValid: true,
      formatted: phoneNumber.formatInternational(), // e.g. "+94 77 123 4567"
      e164: phoneNumber.number, // e.g. "+94771234567"
      country: phoneNumber.country,
      nationalNumber: phoneNumber.nationalNumber,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: "Invalid phone number format.",
    };
  }
}

/**
 * Format as user types (like Stripe phone inputs)
 */
export function formatAsYouType(value: string, defaultCountry: string = "LK"): string {
  const countryCode = resolveCountryCode(defaultCountry);
  const asYouType = new AsYouType(countryCode);
  return asYouType.input(value);
}
