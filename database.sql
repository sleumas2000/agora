DROP DATABASE Agora;
CREATE DATABASE IF NOT EXISTS Agora;
USE Agora;

CREATE TABLE Users (
	UserID int not null primary key auto_increment,
	Username varchar(50) unique not null,
	Email varchar(254) unique not null,
	Surname varchar(50),
	Forename varchar(50),
	PreferredName varchar(50),
	DisplayName varchar(100) not null
);

CREATE TABLE GroupTypes (
	GroupTypeID int not null primary key auto_increment,
	GroupTypeName varchar(50) not null
);

CREATE TABLE Groups (
	GroupID int not null primary key auto_increment,
	GroupName varchar(50) unique not null,
	GroupTypeID int,
	FOREIGN KEY (GroupTypeID) REFERENCES GroupTypes(GroupTypeID)
);

CREATE TABLE LinkGroupsUsers (
	LinkID int not null primary key auto_increment,
	GroupID int not null,
	UserID int not null,
	FOREIGN KEY (GroupID) REFERENCES Groups(GroupID),
	FOREIGN KEY (UserID) REFERENCES Users(UserID),
	UNIQUE LINK (GroupID, UserID)
);

CREATE TABLE Parties (
	PartyID int not null primary key auto_increment,
	PartyName varchar(100) unique not null,
	PathToLogo varchar(256)
	PartyColor varchar(32) default '#808080'
);

CREATE TABLE Candidates (
	CandidateID int not null primary key auto_increment,
	CandidateName varchar(100) not null
);

CREATE TABLE Systems (
	SystemID int not null primary key auto_increment,
	SystemShortName varchar(10) not null unique,
	SystemName varchar(50) not null unique
);

CREATE TABLE Elections (
	ElectionID int not null primary key auto_increment,
	ElectionName varchar(50) unique not null,
  Active bit(1) null default 1
);

CREATE TABLE Votes (
	VoteID int not null primary key auto_increment,
	Timestamp timestamp,
	UserID int not null,
	ElectionID int not null,
	SystemID int not null,
	CandidateID int,
	FOREIGN KEY (UserID) REFERENCES Users(UserID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID),
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	Position int
);

CREATE TABLE LinkCandidatesElections (
	LinkID int not null primary key auto_increment,
	CandidateID int not null,
	ElectionID int not null,
	PartyID int,
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (PartyID) REFERENCES Parties(PartyID),
	UNIQUE LINK (CandidateID, ElectionID)
);

CREATE TABLE LinkElectionsSystems (
	LinkID int not null primary key auto_increment,
	ElectionID int not null,
	SystemID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID),
	UNIQUE LINK (ElectionID, SystemID)
);

CREATE TABLE LinkElectionsGroups (
	LinkID int not null primary key auto_increment,
	ElectionID int not null,
	GroupID int not null,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (GroupID) REFERENCES Groups(GroupTypeID),
	UNIQUE LINK (ElectionID, GroupID)
);
