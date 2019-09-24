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
	name: '',
	nameOpt: 'and',
	teachers: '',
	teachersOpt: 'or',
	credits: new Set(['0', '1', '2', '3', '4+']),
	type: '',
	passwordCard: '',
	periods: new Set(),
	periodsOpt: '',
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
			classNo: this.state.category || undefined,
			name: { text: this.state.name, mode: this.state.nameOpt },
			teachers: { text: this.state.teachers, mode: this.state.teachersOpt },
			credit: this.state.credits,
			type: this.state.type || undefined,
			passwordCard: this.state.passwordCard || undefined,
			periods: { set: this.state.periods, mode: this.state.periodsOpt },
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
	onNameChanged = this.onTargetValueChanged('name');
	onNameOptionChanged = this.onTargetValueChanged('nameOpt');
	onTeachersChanged = this.onTargetValueChanged('teachers');
	onTeachersOptionChanged = this.onTargetValueChanged('teachersOpt');
	onCreditsChanged = this.onTargetValueSetChanged('credits');
	onTypeChanged = this.onTargetValueChanged('type');
	onPasswordCardChanged = this.onTargetValueChanged('passwordCard');
	onPeriodsChanged = this.onTargetValueSetChanged('periods');
	onPeriodsOptionChanged = this.onTargetValueChanged('periodsOpt');
	onExtraOptionsChanged = this.onTargetValueSetChanged('extraOptions');

	toggleDay = (day) => {
		let newPeriods = new Set(this.state.periods);
		for (let hour of HOUR_IDS) {
			let period = `${day}-${hour}`;

			if (!this.state.periods.has(period)) {
				newPeriods.add(period);
			} else {
				newPeriods.delete(period);
			}
		}
		this.setState({ periods: newPeriods });
	};
	toggleHour = (hour) => {
		let newPeriods = new Set(this.state.periods);
		for (let day of DAY_IDS) {
			let period = `${day}-${hour}`;

			if (!this.state.periods.has(period)) {
				newPeriods.add(period);
			} else {
				newPeriods.delete(period);
			}
		}
		this.setState({ periods: newPeriods });
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
							<button className="btn btn-light" onClick={this.onReset}>
								重設所有條件 <FontAwesomeIcon icon='sync-alt' />
							</button>
							&nbsp;
							<button className="btn btn-light" onClick={this.onSearched}>
								開始多重篩選 <FontAwesomeIcon icon='search' />
							</button>
						</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="row-name">選課相關資訊</td>
						<td className="row-content">
							{/* may be dangerous if the source is untrusted */}
							<div dangerouslySetInnerHTML={{ __html: this.props.announcement || 'N/A' }} />
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
											this.props.departmentTree ?
												Object.entries(this.props.departmentTree).map(([k, v]) =>
													<option key={k} value={k}>{v.name}</option>
												) : null
										}
									</select>
								</div>
								<div className="col-auto">
									<select className="custom-select" name="department" id="department" value={this.state.department} onChange={this.onDepartmentChanged}>
										<option value="">【不指定】</option>
										{
											this.state.college !== '' ?
												Object.entries(this.props.departmentTree[this.state.college].departments).map(([k, v]) =>
													<option key={k} value={k}>{v.name}</option>
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
										value={this.state.name} onChange={this.onNameChanged}
									/>
								</div>
								<div className="col-auto form-row">
									<CheckerGroup type="radio"
										name="nameOpt"
										options={
											[
												['and', 'AND'],
												['or', 'OR'],
											].map(e => ({
												key: e[0], label: e[1],
												checked: this.state.nameOpt === e[0]
											}))
										}
										inline={true}
										onChange={this.onNameOptionChanged}
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
									name="type"
									options={
										[
											['', '不篩選'],
											null,
											['required', '必修'],
											['elective', '選修'],
										].map(e => e ? { key: e[0], label: e[1], checked: this.state.type === e[0] } : null)
									}
									inline={true}
									onChange={this.onTypeChanged}
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
											['none', '不使用'],
											['optional', '部分使用'],
											['all', '全部使用'],
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
								periods={this.state.periods}
								periodsOpt={this.state.periodsOpt}
								onPeriodsChanged={this.onPeriodsChanged}
								onPeriodsOptionChanged={this.onPeriodsOptionChanged}
								toggleDay={this.toggleDay}
								toggleHour={this.toggleHour}
							/>
						</td>
					</tr>
					<tr>
						<td className="row-name">進階篩選</td>
						<td className="row-content">
							<CheckerGroup type="checkbox"
								name="extra_options"
								options={
									[
										['isNotFull', '排除目前已額滿的課程'],
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
