CREATE TABLE offers
(
    candidate_id          SERIAL PRIMARY KEY,
    name        VARCHAR(255),
    description VARCHAR(1000),
    active      BOOLEAN,
    date_added  DATE
);
CREATE TABLE users
(
    candidate_id       SERIAL PRIMARY KEY,
    login    VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL,
);


CREATE TABLE roles
(
    candidate_id               SERIAL PRIMARY KEY,
    role_name        varchar(255),
    role_description varchar(1000)
);

create table user_roles
(
    candidate_id      serial primary key,
    user_id int,
    role_id int,
    constraint fk_user foreign key (user_id) references users (candidate_id),
    constraint fk_role foreign key (role_id) references roles (candidate_id)
);

alter table offers
add company_id integer not null default -1,
add constraint fk_offers_company foreign key (company_id) references users(candidate_id);

insert into public.roles (role_name, role_description)
values
('candidate', ''),
('company', '');

create table candidates (
candidate_id serial primary key,
name varchar(30) not null,
surname1 varchar(30) not null,
surname2 varchar(30) not null,
phoneNumber varchar(9) not null,
user_id int not null,
constraint fk_users foreign key (user_id) references users(candidate_id)
);

create table user_offers (
id serial,
user_id int,
offer_id int,
constraint fk_users foreign key (user_id) references users(id),
constraint fk_offers foreign key (offer_id) references offers(id)
);

ALTER TABLE public.offers
    ALTER COLUMN description TYPE VARCHAR(2000);

ALTER TABLE public.user_offers ADD "valid" boolean NULL;


CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    logo VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    url VARCHAR(255) NOT NULL,
    address VARCHAR(155) NOT NULL,
    founded_date DATE NOT NULL,
    user_id INTEGER,
    CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE offer_tag (
    id SERIAL PRIMARY KEY,
    offer_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);
