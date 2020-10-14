// Automatically generates a bunch of fake emails and passwords, given a list of people

// For example, a list of people in the current cohort
const cohort = [ 'Aleksandar Dmitrovic', 'Alfonso Lotina',  'Avvai Ketheeswaran',
'Ayushi Sharma',     'Bryn Schulha',     'Calvin Zheng',
'Chantal Snazel',    'Charles Thompson',  'Cooper Shang',
'Eddy Bussière',       'Eric McGrandle',     'Graeme Chalmers',
'Helen Ouyang',      'Ian Cameron',      'Ife Olaifa',
'Jason Vongsana',      'Jay Ho',      'Jillian Martin',
'Joshua Grant',   'Joshua Tan',   'Kevin Yang',
'Kieran Sharley',     'Kourtney Huget', 'Mackenzie Joyal',
'Marcello Kuenzler',   'Michelle Tran', 'Mohammed Abdulbaqi',
'Nicholas Kotsos',   'Paige Lindahl',    'Paul Chen',
'Saad Muhammad',       'Scott Morton',    'Shadee Merhi',
'Sher Arsalaie',       'Sherwin Kwan',  'Tom Adam',
'Tyler Asai',      'Will Portman',    'Will Zak',
'Z Xian'];

const formEmail = (name, domain) => {
  const splitName = name.split(' ');
  return `${splitName[0]}${splitName[1][0]}@${domain}`;
}

// This function returns output in the form ( ...), (...), etc. making it easy to paste into a database INSERT statement
// All passwords are the word "password" hashed with bcrypt
const createSeeds = () => {
  output = '';
  for (let name of cohort) {
    output += `('${name}', '${formEmail(name, 'lighthouselabs.ca')}', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),\n`;
  };
  return output;
};

console.log(createSeeds());

const random = (max) => {
  return Math.ceil(max * Math.random());
};

const createReservations = (numGuests, numProperties) => {
  let output = '';
  for (let i = 0; i < 30; i++) {
    let randomDay = random(29);
    output += `('2020-10-${randomDay}','2020-10-${randomDay + 2}',${random(numProperties)}, ${random(numGuests)}),\n`;
  };
  return output;
};

console.log(createReservations(40, 5));