const Resume = props => (
  <div className='resume'>
    <div className='row'>
      <Contact {...props.contact} />
      <h1 className='name'>
        <a href='resume.pdf' target='_blank'>{props.name}</a>
      </h1>
    </div>
    <Statement name={props.name}statement={props.statement} />
    <Employment jobs={props.jobs} />
    <Education education={props.education} />
    <Publications publications={props.publications} />
  </div>
);

const Contact = props => (
  <div className='contact'>
    <div className='address'>
    {
      props.address.split('\n').map((item, index) => <div key={index}>{item}</div>)
    }
    </div>
    <div className='email'>
      <a href={`mailto:${props.email}`}>{props.email}</a>
    </div>
    <div className='phone'>{props.phone}</div>
    <div>
      <a href={`https://${props.github}`}>{props.github}</a>
    </div>
    <div>
      <a href={`https://${props.blob}`}>{props.blog}</a>
    </div>
  </div>
);

const Statement = props => (
  <div className='statement'>
  {
    props.statement.split('\n').map((item, index) => <div key={index}>{item}</div>)
  }
  </div>
)

const ListOf = React.createClass({
  getInitialState: function() {
    return { hideAfter: this.props.hideAfter };
  },
  expand: function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.expandAll) {
      this.setState({hideAfter: 0});
    } else {
      this.setState({hideAfter: this.state.hideAfter + 1 });
    }
  },
  render: function() {
    const more = this.state.hideAfter &&
                 this.state.hideAfter < this.props.data.length;
    const visible = more ? this.props.data.slice(0, this.state.hideAfter) : this.props.data;
    const expando = more ? (
                      <div className='expando' onClick={this.expand}>{this.props.more}</div>
                    ) : null;
    return (
      <div>
      {
        visible.map((item, index) => this.props.type(Object.assign({key: index}, item), null))
      }
      {expando}
      </div>
    );
  }
});

const Education = props => (
  <div className='section education'>
    <h2>Education</h2>
    <ListOf data={props.education} type={EducationItem} />
  </div>
);

const EducationItem = props => (
  <div className='educationItem row'>
    <div className='institution'>
    {
      props.institution.split('\n').map((item, index) => <div key={index}>{item}</div>)
    }
    </div>
    <div className='dates'>{props.dates}</div>
    <div className='course'>{props.course}</div>
  </div>
);

const Employment = props => (
  <div className='section employment'>
    <h2>Professional Experience</h2>
    <ListOf data={props.jobs} type={Job} hideAfter={2} more='more jobs &gt;&gt;'/>
  </div>
);

const Job = props => (
  <div className='job'>
    <div className='row'>
      <div className='employer'>{props.employer}</div>
      <div className='date'>{props.from} - {props.to || 'Present'}</div>
    </div>
    <div className='row'>
      <div className='title'>{props.title}</div>
      <div className='technologies'>{props.technologies}</div>
    </div>
    <div className='row'>
      <div className='location'>{props.location}</div>
    </div>
    <div className='row jobExperience'>
        <ListOf data={props.experience} type={Experience} hideAfter={2} more='more details &gt;&gt;&gt;'/>
    </div>
  </div>
);

const Experience = props => (
  <div className='experience'>
    <div className='subtitle'>{props.subtitle}</div>
    <div className='dates'>{props.dates}</div>
    {
      props.body.map((item, index) => <ExperienceItem key={index} data={item} /> )
    }
  </div>
);

const ExperienceItem = props => {
  const parts = props.data.split('\n');
  if (parts.length == 0) {
    return null;
  } else if (parts.length == 1) {
    return <div>{parts[0]}</div>;
  } else {
    return (
      <div>
        {parts[0]}
        <ul>
        {
          parts.slice(1).map((item, index) => <li key={index}>{item}</li>)
        }
        </ul>
      </div>
    );
  }
};

const Publications = props => (
  <div className='section publications'>
    <h2>Publications, Patents</h2>
    <ListOf
      data={props.publications}
      type={Publication}
      hideAfter={1}
      more='show all'
      expandAll={true}/>
  </div>
);

const Publication = props => {
  const title = props.uri ?  (<a href={props.uri} target='_blank'>{props.title}</a>) : props.title;
  return (
    <div className='publication'>
      <div className='title'>{title}</div>
      <div className='publisher'>{props.publisher}</div>
      <div className='date'>{props.date}</div>
    </div>
  );
}

ReactDOM.render(
  <Resume {...resume} />,
  document.getElementById('content')
);
