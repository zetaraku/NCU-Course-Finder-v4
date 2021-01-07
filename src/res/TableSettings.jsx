/* eslint-disable react/display-name */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const course_info_page = 'https://cis.ncu.edu.tw/Course/main/support/courseDetail.html';

export const defaultPageSize = 25;

export const defaultColumn = {
	// Filter: () => null,
	filter: 'text',
	sortType: 'basic',
};

export const filterTypes = {
	includes: (rows, id, filterValue) => {
		return rows.filter(row =>
			row.values[id].includes(filterValue)
		);
	},
	customClassNo: (rows, id, filterValue) => {
		let { classNo, generalCourseOnly } = filterValue;

		let result = rows.filter(row =>
			row.values[id].startsWith(classNo)
		);
		if (generalCourseOnly) {
			result = result.filter(row =>
				row.values[id].startsWith('CC') || row.values[id].startsWith('GS')
			);
		}

		return result;
	},
	customCredit: (rows, id, filterValue) => {
		return rows.filter(row =>
			filterValue.has(String(row.values[id]))
			|| (filterValue.has('4+') && row.values[id] >= 4)
		);
	},
	customRemainCnt: (rows, id, filterValue) => {
		return rows.filter(row =>
			!filterValue.isNotFull || row.values[id] > 0
		);
	},
	customPeriods: (rows, id, filterValue) => {
		let { set, mode } = filterValue;

		if (mode === '') {
			return rows;
		} else if (mode === 'include') {
			return rows.filter(row =>
				row.values[id].split(', ').some(hour =>
					set.has(hour)
				));
		} else if (mode === 'enclose') {
			return rows.filter(row =>
				row.values[id].split(', ').every(hour =>
					set.has(hour)
				));
		} else if (mode === 'exclude') {
			return rows.filter(row =>
				!row.values[id].split(', ').some(hour =>
					set.has(hour)
				));
		}
	},
	optionizedText: (rows, id, filterValue) => {
		let { text, mode } = filterValue;
		let searchTerms = text.trim().split(/\s+/).filter(e => e !== '');

		if (searchTerms.length === 0) {
			return rows;
		} else if (mode === 'and') {
			return rows.filter(row =>
				searchTerms.every(term =>
					matchNegatableTerm(row.values[id], term)
				)
			);
		} else if (mode === 'or') {
			return rows.filter(row =>
				searchTerms.some(term =>
					matchNegatableTerm(row.values[id], term)
				)
			);
		} else if (mode === 'nor') {
			return rows.filter(row =>
				!searchTerms.some(term =>
					matchNegatableTerm(row.values[id], term)
				)
			);
		} else {
			throw new Error(`Unknown filter mode: '${mode}'`);
		}
	},
};

export const sortTypes = {
	number: (rowA, rowB, columnID) => {
		let a = rowA.values[columnID];
		let b = rowB.values[columnID];

		return compareNumber(a, b);
	}
};

export const columns = [
	{
		Header: '課號',
		accessor: 'classNo',
		Cell: ({ cell }) => {
			return (
				<>
					<span className="d-md-none" title={cell.value.replace('*', '')}>
						<FontAwesomeIcon icon="info-circle" size="lg" />
					</span>
					<span className="d-none d-md-inline">
						{cell.value.replace('*', '')}
					</span>
				</>
			);
		},
		filter: 'customClassNo',
	},
	{
		Header: '課程名稱',
		accessor: 'title',
		Cell: ({ cell }) => (
			<div style={{ position: 'relative' }}>
				{makeInfoBadge(cell.row.original)}
				<a
					title={cell.value}
					target="_blank" rel="noopener noreferrer"
					href={`${course_info_page}?crs=${cell.row.original.serialNo}`}
				>
					{cell.value}
				</a>
			</div>
		),
		filter: 'optionizedText',
	},
	{
		Header: '導師',
		id: 'teachers',
		accessor: (original) => (
			original.teachers.join('\n')
		),
		Cell: ({ cell }) => cell.value.split('\n').map(e =>
			<span key={e}>
				{e}<br />
			</span>
		),
		filter: 'optionizedText',
	},
	{
		Header: '選/必',
		accessor: 'courseType',
		Cell: ({ cell }) => (
			getTypeTag(cell.row.original)
		),
		filter: 'equals',
	},
	{
		Header: '學分',
		accessor: 'credit',
		filter: 'customCredit',
		sortType: 'number',
	},
	{
		Header: '中選率',
		accessor: 'successRate',
		Cell: ({ cell }) => {
			let adjustedValue = Math.max(0, Math.min(100, cell.value));
			return (
				<div style={{ background: `linear-gradient(to right, rgba(0,255,0,1) ${adjustedValue}%, rgba(0,0,0,0) ${adjustedValue}%)` }}>
					{friendlyNumber(cell.row.original.remainCnt)} / {friendlyNumber(cell.row.original.waitCnt)} ({friendlyNumber(cell.value)}%)
				</div>
			);
		},
		sortType: 'number',
		sortDescFirst: true,
	},
	{
		Header: '飽和度',
		accessor: 'fullRate',
		Cell: ({ cell }) => {
			let adjustedValue = Math.max(0, Math.min(100, cell.value));
			return (
				<div style={{ background: `linear-gradient(to right, rgba(255,165,0,1) ${adjustedValue}%, rgba(0,0,0,0) ${adjustedValue}%)` }}>
					{friendlyNumber(cell.row.original.admitCnt)} / {friendlyNumber(cell.row.original.limitCnt)} ({friendlyNumber(cell.value)}%)
				</div>
			);
		},
		sortType: 'number',
		sortDescFirst: true,
	},
	{
		Header: '上課時段',
		id: 'classTimes',
		accessor: (original) => original.classTimes.join(', '),
		Cell: ({ cell }) => (
			cell.value !== '' ?
				cell.value.split(', ').filter(e => e !== '').map(e =>
					<><span key={e} className="badge badge-pill badge-primary time-pill">{e}</span></>
				) : (
					<span className="badge badge-pill badge-secondary time-pill">無資料</span>
				)
		),
		disableSorting: true,
		filter: 'customPeriods'
	},
	{
		Header: '密碼卡',
		accessor: 'passwordCard',
		filter: 'equals',
		show: false,
	},
	{
		Header: '學院',
		id: 'college',
		accessor: 'collegeIds',
		filter: 'includes',
		show: false,
	},
	{
		Header: '系別',
		id: 'department',
		accessor: 'departmentIds',
		filter: 'includes',
		show: false,
	},
	{
		Header: '剩餘名額',
		accessor: 'remainCnt',
		filter: 'customRemainCnt',
		show: false,
	},
];

function compareNumber(a, b) {
	if (isNaN(a) && isNaN(b)) {
		return 0;
	} else if (isNaN(a)) {
		return -1;
	} else if (isNaN(b)) {
		return +1;
	} else {
		return (a === b ? 0 : (a < b ? -1 : +1));
	}
}

function matchNegatableTerm(name, term) {
	let inverse = false;
	if (term.charAt(0) === '!') {
		inverse = true;
		term = term.substr(1);
	}
	return (inverse !== new RegExp(term, 'i').test(name));	// a logical XOR
}

function makeInfoBadge(course) {
	return (
		<div className="hovered-badges">
			{course.limitCnt === Infinity &&
				<span role="img" aria-label="無人數上限" className="badge" title="無人數上限" style={{ backgroundColor: 'skyblue', color: 'white' }}>
					<FontAwesomeIcon icon="infinity" />
				</span>
			}
			{course.passwordCard === 'ALL' &&
				<span role="img" aria-label="需要密碼卡" className="badge" title="需要密碼卡" style={{ backgroundColor: 'yellow', color: 'darkgray' }}>
					<FontAwesomeIcon icon="lock" />
				</span>
			}
		</div>
	);
}

function getTypeTag(course) {
	if (/^CC/.test(course.classNo))
		return <span className="badge badge-primary">核心通識</span>;
	if (/^GS/.test(course.classNo))
		return <span className="badge badge-success">一般通識</span>;
	if (course.courseType === 'REQUIRED')
		return <span className="badge badge-primary">必修</span>;
	if (course.courseType === 'ELECTIVE')
		return <span className="badge badge-success">選修</span>;

	return <span className="badge badge-secondary">無資料</span>;
}

function friendlyNumber(n) {
	if (n === +Infinity) {
		return '+∞';
	} else if (n === -Infinity) {
		return '-∞';
	} else if (isNaN(n)) {
		return '?';
	} else {
		return String(n);
	}
}
