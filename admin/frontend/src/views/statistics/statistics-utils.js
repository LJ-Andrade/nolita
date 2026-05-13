export function exportRowsToCsv(filename, rows, columns) {
	const escapeCsvValue = (value) => {
		const normalizedValue = value ?? "";
		const stringValue = String(normalizedValue);

		if (/[",\n]/.test(stringValue)) {
			return `"${stringValue.replaceAll('"', '""')}"`;
		}

		return stringValue;
	};

	const csv = [
		columns.map((column) => escapeCsvValue(column.label)).join(","),
		...rows.map((row) => columns.map((column) => escapeCsvValue(column.value(row))).join(",")),
	].join("\n");

	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

export function formatPercentChange(value) {
	if (value === null || value === undefined) {
		return "Nuevo";
	}

	if (value === 0) {
		return "0%";
	}

	return `${value > 0 ? "+" : ""}${value}%`;
}
