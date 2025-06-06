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

ALTER TABLE public.users ADD name varchar(255) NOT NULL;
