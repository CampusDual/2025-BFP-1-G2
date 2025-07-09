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

ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS professional_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS years_of_experience VARCHAR(50),
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS curriculum_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS figma_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS personal_website_url VARCHAR(500);

CREATE TABLE candidate_tags (
    id serial PRIMARY KEY,
    candidate_id INT NOT NULL,
    tag_id INT NOT NULL,
    CONSTRAINT fk_candidate_id FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    CONSTRAINT fk_tag_id FOREIGN KEY (tag_id) REFERENCES tag(id)
);

create table candidate_bookmarks
(
    id       serial  not null
        constraint candidate_bookmarks_pk
            primary key,
    user_id  integer not null
        constraint candidate_bookmarks_users_id_fk
            references users,
    offer_id integer not null
        constraint candidate_bookmarks_offers_id_fk
            references offers
);

CREATE TABLE candidate_experience (
    id SERIAL PRIMARY KEY,
    candidate_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    responsibilities TEXT,
    CONSTRAINT fk_candidate_experience FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);
