import $ from 'jquery';
import React from 'react';

export default class InfoModal extends React.Component {
	constructor(props) {
		super(props);
		this.nodeRef = React.createRef();
	}

	componentDidMount() {
		$(this.nodeRef.current).modal('show');
		// $(this.nodeRef).on('hidden.bs.modal', this.props.handleHideModal);
	}

	render() {
		return (
			<div className="InfoModal modal fade" ref={this.nodeRef} tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog modal-lg modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{this.props.title}</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body" style={{ whiteSpace: 'pre' }}
							dangerouslySetInnerHTML={{ __html: this.props.innerHTML }}>
						</div>
						<div className="modal-footer">
							{/* <button type="button" className="btn btn-default" data-dismiss="modal">Close</button> */}
							<button type="button" className="btn btn-primary" data-dismiss="modal">{this.props.okMessage}</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
