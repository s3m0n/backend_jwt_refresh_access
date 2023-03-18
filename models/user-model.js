const userSchema = {
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    isActivated: {type: boolen, default: false},
    activationLink: {type: String}
}
/*
create TABLE accounts( 
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    isActivated BOOLEAN DEFAULT FALSE,
    activationLink VARCHAR(255) NOT NULL,
    created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP
);

*/