CREATE DATABASE IF NOT EXISTS Agora;
USE Agora;

CREATE TABLE Users (
	UserID int not null primary key auto_increment,
	Username varchar(50) not null,
	Email varchar(254) unique not null,
	Surname varchar(50),
	Forename varchar(50),
	PreferredName varchar(50),
  DisplayName varchar(100) not null
);

CREATE TABLE GroupTypes (
	GroupTypeID int not null primary key auto_increment,
	Name varchar(50) not null
);

CREATE TABLE Groups (
	GroupID int not null primary key auto_increment,
	Name varchar(50) unique not null,
	GroupTypeID int not null,
	FOREIGN KEY (GroupTypeID) REFERENCES GroupTypes(GroupTypeID)
);

CREATE TABLE LinkGroupsUsers (
	LinkID int not null primary key auto_increment,
	GroupID int not null,
	UserID int not null,
	FOREIGN KEY (GroupID) REFERENCES Groups(GroupTypeID),
	FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Parties (
	PartyID int not null primary key auto_increment,
	Name varchar(100) unique not null,
	PathToLogo varchar(256)
);

CREATE TABLE Candidates (
	CandidateID int not null primary key auto_increment,
	Name varchar(100) not null,
	FOREIGN KEY (PartyID) REFERENCES Parties(PartyID)
);

CREATE TABLE Systems (
	SystemID int not null primary key auto_increment,
	Name varchar(50) not null unique
);

CREATE TABLE Elections (
	ElectionID int not null primary key auto_increment,
	Name varchar(50) unique not null
);

CREATE TABLE Votes (
	VoteID int not null primary key auto_increment,
	Timestamp timestamp,
	UserID int not null,
	ElectionID int not null,
	SystemID int not null,
	CandidateID int not null,
	FOREIGN KEY (UserID) REFERENCES Users(UserID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID),
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	Score int
);

CREATE TABLE LinkCandidatesElections (
	LinkID int not null primary key auto_increment,
	CandidateID int not null,
	ElectionID int not null,
	PartyID int,
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (PartyID) REFERENCES Parties(PartyID)
);

CREATE TABLE LinkElectionsSystems (
	LinkID int not null primary key auto_increment,
	ElectionID int not null,
	SystemID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID)
);

CREATE TABLE LinkElectionsCandidates (
	LinkID int not null primary key auto_increment,
	ElectionID int not null,
	CandidateID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID)
);

CREATE TABLE LinkElectionsGroups (
	LinkID int not null primary key auto_increment,
	ElectionID int not null,
	GroupID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (GroupID) REFERENCES Groups(GroupTypeID)
);
