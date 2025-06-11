CREATE TABLE offers
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255),
    description VARCHAR(1000),
    active      BOOLEAN,
    date_added  DATE
);
CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    login    VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL,
);


CREATE TABLE roles
(
    id               SERIAL PRIMARY KEY,
    role_name        varchar(255),
    role_description varchar(1000)
);

create table user_roles
(
    id      serial primary key,
    user_id int,
    role_id int,
    constraint fk_user foreign key (user_id) references users (id),
    constraint fk_role foreign key (role_id) references roles (id)
);

alter table offers
add company_id integer not null default -1,
add constraint fk_offers_company foreign key (company_id) references users(id);

insert into public.roles (role_name, role_description)
values
('candidate', ''),
('company', '');

create table candidates (
candidate_id serial primary key,
name varchar(30) not null,
surname1 varchar(30) not null,
surname2 varchar(30) not null,
phone_number varchar(9) not null,
user_id int not null,
constraint fk_users foreign key (user_id) references users(id)
);