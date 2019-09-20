import $ from 'jquery';
import 'bootstrap';
import React, { useState, useEffect } from 'react';
import {
	useTable,
	useFilters,
	useSortBy,
	usePagination,
	useTableState,
} from 'react-table';
import moment from 'moment';
import 'moment/locale/zh-tw';

import InfoModal from './InfoModal';
import SearchPanel from './SearchPanel';
import ResultPanel from './ResultPanel';
import * as TableSettings from 'res/TableSettings';
import { remote_data_host } from 'res/_settings';


export default function App() {
	const [courses, setCourse] = useState([]);
	const [lastUpdate, setLastUpdate] = useState(null);
	const [departmentTree, setDepartmentTree] = useState(null);
	const [popupInfo, setPopupInfo] = useState(null);
	const [announcement, setAnnouncement] = useState(null);

	useEffect(init, [/* This empty array is f**king important */]);

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

	const onSearched = React.useCallback((filters) => {
		instance.setAllFilters(filters);
		$([document.documentElement, document.body]).animate({
			scrollTop: $('.ResultPanel').offset().top
		}, 500);
	}, [instance]);

	return (
		<div className="App">
			{
				popupInfo !== null &&
				<InfoModal
					title="※※免責聲明※※"
					innerHTML={popupInfo}
					okMessage="好，我知道了"
				/>
			}
			<SearchPanel
				title="NCU Course Finder 4.0"
				announcement={announcement}
				departmentTree={departmentTree}
				lastUpdate={lastUpdate}
				onSearched={onSearched}
			/>
			<ResultPanel
				instance={instance}
			/>
		</div>
	);

	function init() {
		fetch(`${remote_data_host}/info/popup_info.html?ts=${moment().valueOf()}`)
			.then((res) => res.text())
			.then((result) => {
				setPopupInfo(result);
			});

		fetch(`${remote_data_host}/info/announcement.html?ts=${moment().valueOf()}`)
			.then((res) => res.text())
			.then((result) => {
				setAnnouncement(result);
			});

		Promise.all([
			fetch(`${remote_data_host}/dynamic/courses.json?ts=${moment().valueOf()}`),
			fetch(`${remote_data_host}/dynamic/department_tree.json?ts=${moment().valueOf()}`),
		]).then(async ([courses_response, department_tree_response]) => {
			let { courses, LAST_UPDATE_TIME } = await courses_response.json();
			let { department_tree } = await department_tree_response.json();

			Object.values(courses).forEach(course => {
				try {
					course.deptname = department_tree[course.colecode].departments[course.deptcode].name;
				} catch (e) {
					course.deptname = 'N/A';
				}

				if (course.limitCnt === 0) {
					course.limitCnt = Infinity;
				}
				course.remainCnt = course.limitCnt - course.admitCnt;
				course.successRate = getRate(course.remainCnt, course.waitCnt);
				course.fullRate = getRate(course.admitCnt, course.limitCnt);
			});

			setDepartmentTree(department_tree);
			setCourse(Object.values(courses));
			setLastUpdate(moment.unix(LAST_UPDATE_TIME));
		});

		function getRate(n, d) {
			return Math.floor(1000 * n / d) / 10;
		}
	}
}
