import React from 'react';
import {
	useTable,
	useFilters,
	useSortBy,
	usePagination,
	useTableState,
} from 'react-table';
import ResultPanel from 'App/ResultPanel';
import * as TableSettings from 'res/TableSettings';

export default function ResultPanelWrapper({ courses, instanceCallback }) {
	const tableState = useTableState({
		pageSize: TableSettings.defaultPageSize,
	});

	// Use the state and functions returned from useTable to build the ReactTable UI
	const instance = useTable(
		{
			columns: TableSettings.columns,
			data: courses,
			state: tableState,

			filterTypes: TableSettings.filterTypes,
			sortTypes: TableSettings.sortTypes,
			defaultColumn: TableSettings.defaultColumn,
			disableSortRemove: true,
		},
		useFilters,
		useSortBy,
		usePagination,
	);

	instanceCallback(instance);		// pass the instance to the parent

	return (
		<ResultPanel instance={instance} />
	);
}
