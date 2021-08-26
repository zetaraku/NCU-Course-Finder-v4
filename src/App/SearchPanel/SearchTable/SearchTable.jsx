import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SchedulePanel, { DAY_IDS, HOUR_IDS } from './SchedulePanel';
import CheckerGroup from 'util/CheckerGroup';
import filter_category from 'res/filter_category.json';
import ReactGA from 'react-ga';

const getDefaultState = () => ({
	college: '',
	department: '',
	category: '',
	title: '',
	titleOpt: 'and',
	teachers: '',
	teachersOpt: 'or',
	credits: new Set(['0', '1', '2', '3', '4+']),
	courseType: '',
	passwordCard: '',
	classTimes: new Set(),
	classTimesOpt: '',
	extraOptions: new Set(),
});

export default class SearchPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			...getDefaultState(),
		};
	}

	onReset = () => {
		if (window.confirm('確定要重設表單嗎？')) {
			// setState is async, use callback!
			this.setState(getDefaultState(), this.onSearched);
		}
	};
	onSearched = () => {
		ReactGA.event({
			category: 'FilterTable',
			action: 'Search',
		});
		this.props.onSearched({
			college: this.state.college || undefined,
			department: this.state.department || undefined,
			classNo: {
				classNo: this.state.category,
				generalCourseOnly: this.state.extraOptions.has('generalCourseOnly'),
			},
			title: { text: this.state.title, mode: this.state.titleOpt },
			teachers: { text: this.state.teachers, mode: this.state.teachersOpt },
			credit: this.state.credits,
			courseType: this.state.courseType || undefined,
			passwordCard: this.state.passwordCard || undefined,
			classTimes: { set: this.state.classTimes, mode: this.state.classTimesOpt },
			remainCnt: { isNotFull: this.state.extraOptions.has('isNotFull') },
			// extraOptions: this.state.extraOptions,
		});
	};

	onTargetValueChanged = (stateName) => (event) => {
		this.setState({ [stateName]: event.target.value });
	};
	onTargetValueSetChanged = (stateName) => (event) => {
		let newState = new Set(this.state[stateName]);
		newState[event.target.checked ? 'add' : 'delete'](event.target.value);
		this.setState({ [stateName]: newState });
	};

	onCollegeChanged = (event) => {
		this.setState({ college: event.target.value, department: '' });
	};
	onDepartmentChanged = this.onTargetValueChanged('department');
	onCategoryChanged = this.onTargetValueChanged('category');
	onTitleChanged = this.onTargetValueChanged('title');
	onTitleOptionChanged = this.onTargetValueChanged('titleOpt');
	onTeachersChanged = this.onTargetValueChanged('teachers');
	onTeachersOptionChanged = this.onTargetValueChanged('teachersOpt');
	onCreditsChanged = this.onTargetValueSetChanged('credits');
	onCourseTypeChanged = this.onTargetValueChanged('courseType');
	onPasswordCardChanged = this.onTargetValueChanged('passwordCard');
	onClassTimesChanged = this.onTargetValueSetChanged('classTimes');
	onClassTimesOptionChanged = this.onTargetValueChanged('classTimesOpt');
	onExtraOptionsChanged = this.onTargetValueSetChanged('extraOptions');

	toggleDay = (day) => {
		let newClassTimes = new Set(this.state.classTimes);
		for (let hour of HOUR_IDS) {
			let classTime = `${day}-${hour}`;

			if (!this.state.classTimes.has(classTime)) {
				newClassTimes.add(classTime);
			} else {
				newClassTimes.delete(classTime);
			}
		}
		this.setState({ classTimes: newClassTimes });
	};
	toggleHour = (hour) => {
		let newClassTimes = new Set(this.state.classTimes);
		for (let day of DAY_IDS) {
			let classTime = `${day}-${hour}`;

			if (!this.state.classTimes.has(classTime)) {
				newClassTimes.add(classTime);
			} else {
				newClassTimes.delete(classTime);
			}
		}
		this.setState({ classTimes: newClassTimes });
	};

	render() {
		return (
			<table className="SearchTable">
				<thead>
					<tr>
						<td colSpan={2} className="title">
							<strong>{this.props.title}</strong><br />
							<cite>
								{
									this.props.isEggState() &&
									<>- A rescue from the place where Nobody Care U.&nbsp;</>
								}
								<span className='egg' onClick={this.props.onEggClicked}>
									<FontAwesomeIcon icon='running'
										size='lg' spin={this.props.isEggState()}
									/>
								</span>
							</cite>
						</td>
					</tr>
					<tr>
						<td colSpan={2} className="search">
							<button className="btn btn-light mx-3 my-2" onClick={this.onReset}>
								重設所有條件 <FontAwesomeIcon icon='sync-alt' />
							</button>
							<button className="btn btn-light mx-3 my-2" onClick={this.onSearched}>
								開始多重篩選 <FontAwesomeIcon icon='search' />
							</button>
						</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="row-name">選課相關資訊</td>
						<td className="row-content">
							<a
								target="_blank" rel="noopener noreferrer"
								href="http://pdc.adm.ncu.edu.tw/Course/course/COUR_S.pdf"
							>[課務相關日程表]</a>
						</td>
					</tr>
					<tr>
						<td className="row-name">資料更新日期</td>
						<td className="row-content">
							{
								this.props.lastUpdate ? <>
									{this.props.lastUpdate.format('Y/M/D H:mm')}
									&nbsp;({this.props.lastUpdate.fromNow()})
								</> : 'N/A'
							}
						</td>
					</tr>
					<tr>
						<td className="row-name">學院／系別</td>
						<td className="row-content">
							<div className="form-row">
								<div className="col-auto">
									<select className="custom-select" name="college" id="college" value={this.state.college} onChange={this.onCollegeChanged}>
										<option value="">【不指定】</option>
										{
											this.props.colleges ?
												this.props.colleges.map(({ collegeId, collegeName }) =>
													<option key={collegeId} value={collegeId}>{collegeName}</option>
												) : null
										}
									</select>
								</div>
								<div className="col-auto">
									<select className="custom-select" name="department" id="department" value={this.state.department} onChange={this.onDepartmentChanged}>
										<option value="">【不指定】</option>
										{
											this.state.college !== '' ?
												this.props.departments.filter(e => e.collegeId === this.state.college)
													.map(department =>
														<option key={department.departmentId} value={department.departmentId}>
															{department.departmentName}
														</option>
													) : null
										}
									</select>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td className="row-name">類別篩選</td>
						<td className="row-content">
							<div className="form-row">
								<div className="col-auto">
									<select className="custom-select" name="category" id="category" value={this.state.category} onChange={this.onCategoryChanged}>
										<option value="">【不篩選】</option>
										{
											Object.entries(filter_category).map(([k, v]) =>
												<option key={k} value={k}>{v} ({k})</option>
											)
										}
									</select>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td className="row-name">課程名稱</td>
						<td className="row-content">
							<div className="form-row align-items-center">
								<div className="col-auto">
									<input type="text"
										className="form-control" placeholder="請輸入關鍵字"
										value={this.state.title} onChange={this.onTitleChanged}
									/>
								</div>
								<div className="col-auto form-row">
									<CheckerGroup type="radio"
										name="titleOpt"
										options={
											[
												['and', 'AND'],
												['or', 'OR'],
											].map(e => ({
												key: e[0], label: e[1],
												checked: this.state.titleOpt === e[0]
											}))
										}
										inline={true}
										onChange={this.onTitleOptionChanged}
									/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td className="row-name">導師名稱</td>
						<td className="row-content">
							<div className="form-row align-items-center">
								<div className="col-auto">
									<input type="text"
										className="form-control" placeholder="請輸入關鍵字"
										value={this.state.teachers} onChange={this.onTeachersChanged}
									/>
								</div>
								<div className="col-auto form-row">
									<CheckerGroup type="radio"
										name="teachersOpt"
										options={
											[
												['or', 'OR'],
												['nor', 'NOR'],
											].map(e => ({
												key: e[0], label: e[1],
												checked: this.state.teachersOpt === e[0]
											}))
										}
										inline={true}
										onChange={this.onTeachersOptionChanged}
									/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td className="row-name">學分數</td>
						<td className="row-content">
							<div className="form-row align-items-center">
								<CheckerGroup type="checkbox"
									name="credits"
									options={
										['0', '1', '2', '3', '4+'].map(e => ({ key: e, label: e, checked: this.state.credits.has(e) }))
									}
									inline={true}
									onChange={this.onCreditsChanged}
								/>
							</div>
						</td>
					</tr>
					<tr>
						<td className="row-name">必修／選修</td>
						<td className="row-content">
							<div className="form-row align-items-center">
								<CheckerGroup type="radio"
									name="courseType"
									options={
										[
											['', '不篩選'],
											null,
											['REQUIRED', '必修'],
											['ELECTIVE', '選修'],
										].map(e => e ? { key: e[0], label: e[1], checked: this.state.courseType === e[0] } : null)
									}
									inline={true}
									onChange={this.onCourseTypeChanged}
								/>
							</div>
						</td>
					</tr>
					<tr>
						<td className="row-name">密碼卡</td>
						<td className="row-content">
							<div className="form-row align-items-center">
								<CheckerGroup type="radio"
									name="passwordCard"
									options={
										[
											['', '不篩選', true],
											null,
											['NONE', '不使用'],
											['OPTIONAL', '部分使用'],
											['ALL', '全部使用'],
										].map(e => e ? { key: e[0], label: e[1], checked: this.state.passwordCard === e[0] } : null)
									}
									inline={true}
									onChange={this.onPasswordCardChanged}
								/>
							</div>
						</td>
					</tr>
					<tr>
						<td className="row-name">上課時段</td>
						<td className="row-content">
							<SchedulePanel
								periods={this.state.classTimes}
								periodsOpt={this.state.classTimesOpt}
								onPeriodsChanged={this.onClassTimesChanged}
								onPeriodsOptionChanged={this.onClassTimesOptionChanged}
								toggleDay={this.toggleDay}
								toggleHour={this.toggleHour}
							/>
						</td>
					</tr>
					<tr>
						<td className="row-name">進階篩選</td>
						<td className="row-content">
							<CheckerGroup type="checkbox"
								name="extraOptions"
								options={
									[
										['isNotFull', '排除目前已額滿的課程'],
										['generalCourseOnly', '只顯示通識課'],
									].map(e => ({ key: e[0], label: e[1], checked: this.state.extraOptions.has(e[0]) }))
								}
								inline={false}
								onChange={this.onExtraOptionsChanged}
							/>
						</td>
					</tr>
					{/* <tr>
						<td className="row-name">搜尋連結</td>
						<td className="row-content">
							<div className="form-row align-items-center">
								<div className="col-auto">
									<input type="text" className="form-control" defaultValue="N/A" disabled/>
								</div>
							</div>
						</td>
					</tr> */}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={2} className="author">
							Made by <a href='https://github.com/zetaraku/'>Raku Zeta</a>,
							licensed under the <a href='https://en.wikipedia.org/wiki/MIT_License'>MIT</a> license.
							&nbsp;
							<a href='https://github.com/zetaraku/NCU-Course-Finder-v4'>
								<FontAwesomeIcon icon={['fab', 'github']} size="lg" />
							</a>
						</td>
					</tr>
				</tfoot>
			</table>
		);
	}
}
