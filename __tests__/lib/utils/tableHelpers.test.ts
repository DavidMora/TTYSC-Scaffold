import { getFormattedValueByAccessor } from "@/lib/utils/tableHelpers";
import { TableDataRow } from "@/lib/types/datatable";

describe("tableHelpers", () => {
  describe("getFormattedValueByAccessor", () => {
    const mockTableRow: TableDataRow = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      isActive: true,
      salary: 75000.5,
      profile: {
        bio: "Software Developer",
        location: {
          city: "New York",
          country: "USA",
        },
        skills: ["JavaScript", "TypeScript", "React"],
        preferences: {
          theme: "dark",
          notifications: true,
        },
      },
      metadata: null,
      emptyString: "",
      zero: 0,
      falseValue: false,
    };

    it("should format string values correctly", () => {
      expect(getFormattedValueByAccessor(mockTableRow, "name")).toBe(
        "John Doe"
      );
      expect(getFormattedValueByAccessor(mockTableRow, "email")).toBe(
        "john@example.com"
      );
      expect(getFormattedValueByAccessor(mockTableRow, "profile.bio")).toBe(
        "Software Developer"
      );
    });

    it("should format number values correctly", () => {
      expect(getFormattedValueByAccessor(mockTableRow, "age")).toBe("30");
      expect(getFormattedValueByAccessor(mockTableRow, "salary")).toBe(
        "75000.5"
      );
      expect(getFormattedValueByAccessor(mockTableRow, "zero")).toBe("0");
    });

    it("should format boolean values correctly", () => {
      expect(getFormattedValueByAccessor(mockTableRow, "isActive")).toBe(
        "true"
      );
      expect(getFormattedValueByAccessor(mockTableRow, "falseValue")).toBe(
        "false"
      );
      expect(
        getFormattedValueByAccessor(
          mockTableRow,
          "profile.preferences.notifications"
        )
      ).toBe("true");
    });

    it("should format object values as JSON strings", () => {
      expect(
        getFormattedValueByAccessor(mockTableRow, "profile.location")
      ).toBe(JSON.stringify({ city: "New York", country: "USA" }));
      expect(getFormattedValueByAccessor(mockTableRow, "profile.skills")).toBe(
        JSON.stringify(["JavaScript", "TypeScript", "React"])
      );
      expect(
        getFormattedValueByAccessor(mockTableRow, "profile.preferences")
      ).toBe(JSON.stringify({ theme: "dark", notifications: true }));
    });

    it("should return empty string for null values", () => {
      expect(getFormattedValueByAccessor(mockTableRow, "metadata")).toBe("");
    });

    it("should return empty string for undefined values", () => {
      expect(getFormattedValueByAccessor(mockTableRow, "nonExistent")).toBe("");
      expect(
        getFormattedValueByAccessor(mockTableRow, "profile.nonExistent")
      ).toBe("");
    });

    it("should handle empty string values", () => {
      expect(getFormattedValueByAccessor(mockTableRow, "emptyString")).toBe("");
    });

    it("should handle nested object access", () => {
      expect(
        getFormattedValueByAccessor(mockTableRow, "profile.location.city")
      ).toBe("New York");
      expect(
        getFormattedValueByAccessor(mockTableRow, "profile.preferences.theme")
      ).toBe("dark");
    });

    it("should handle non-standard value types", () => {
      const objWithSpecialValues = {
        symbol: Symbol("test"),
        func: () => "test",
        bigint: BigInt(123),
        date: new Date("2023-01-01"),
      } as unknown as TableDataRow;

      // Symbol, function, and bigint should return empty string as they don't match the expected types
      expect(getFormattedValueByAccessor(objWithSpecialValues, "symbol")).toBe(
        ""
      );
      expect(getFormattedValueByAccessor(objWithSpecialValues, "func")).toBe(
        ""
      );
      expect(getFormattedValueByAccessor(objWithSpecialValues, "bigint")).toBe(
        ""
      );

      // Date objects should be stringified as JSON
      expect(getFormattedValueByAccessor(objWithSpecialValues, "date")).toBe(
        JSON.stringify(new Date("2023-01-01"))
      );
    });

    it("should handle arrays correctly", () => {
      const objWithArrays = {
        numbers: [1, 2, 3],
        strings: ["a", "b", "c"],
        mixed: [1, "two", true, null],
        nested: [{ id: 1 }, { id: 2 }],
      } as unknown as TableDataRow;

      expect(getFormattedValueByAccessor(objWithArrays, "numbers")).toBe(
        JSON.stringify([1, 2, 3])
      );
      expect(getFormattedValueByAccessor(objWithArrays, "strings")).toBe(
        JSON.stringify(["a", "b", "c"])
      );
      expect(getFormattedValueByAccessor(objWithArrays, "mixed")).toBe(
        JSON.stringify([1, "two", true, null])
      );
      expect(getFormattedValueByAccessor(objWithArrays, "nested")).toBe(
        JSON.stringify([{ id: 1 }, { id: 2 }])
      );
    });

    it("should handle empty accessor path", () => {
      expect(getFormattedValueByAccessor(mockTableRow, "")).toBe("");
    });

    it("should handle edge cases consistently with getValueByAccessor", () => {
      // Non-existent nested properties
      expect(
        getFormattedValueByAccessor(mockTableRow, "metadata.nonExistent")
      ).toBe("");
      expect(getFormattedValueByAccessor(mockTableRow, "name.length")).toBe("");

      // Very deep nesting that doesn't exist
      expect(getFormattedValueByAccessor(mockTableRow, "a.b.c.d.e.f")).toBe("");
    });
  });
});
