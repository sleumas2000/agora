CREATE DATABASE IF NOT EXISTS Agora;

Use Agora

CREATE TABLE Users (
  UserID int not null primary key auto_increment,
  Username varchar(40),
	Email varchar(254),
	Surname varchar(50),
	Forename varchar(50),
  PreferredName varchar(50)
);

CREATE TABLE Groups (
	GroupID int not null primary key auto_increment,
	Name varchar(50),
	FOREIGN KEY (GroupTypeID) REFERENCES Groups(GroupTypeID),
);

CREATE TABLE GroupTypes (
	GroupTypeID int not null primary key auto_increment,
	Name varchar(50),
);

CREATE TABLE LinkGroupsUsers (
	LinkID int not null primary key auto_increment,
	FOREIGN KEY (GroupID) REFERENCES Groups(GroupTypeID),
	FOREIGN KEY (UserID) REFERENCES Users(UserID),
);

CREATE TABLE Votes (
	VoteID int not null primary key auto_increment,
	FOREIGN KEY (UserID) REFERENCES Users(UserID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID),
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	Score int
);

CREATE TABLE Candidates (
	CandidateID int not null primary key auto_increment,
	Name varchar(100),
	FOREIGN KEY (PartyID) REFERENCES Parties(PartyID)
);

CREATE TABLE LinkCandidatesElections (
	LinkID int not null primary key auto_increment,
	FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (PartyID) REFERENCES Parties(PartyID)
);

CREATE TABLE Parties (
	PartyID int not null primary key auto_increment,
	Name varchar(100),
  PathToLogo varchar(256)
);

CREATE TABLE Elections (
	ElectionID int not null primary key auto_increment,
  Name varchar(50)
);

CREATE TABLE Systems (
	SystemID int not null primary key auto_increment,
  Name varchar(50)
);

CREATE TABLE LinkElectionsSystems (
	LinkID int not null primary key auto_increment,
	FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
	FOREIGN KEY (SystemID) REFERENCES Systems(SystemID),
);

CREATE TABLE LinkElectionsCandidates (
  LinkID int not null primary key auto_increment,
  FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
  FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID),
);

CREATE TABLE LinkElectionsGroups (
  LinkID int not null primary key auto_increment,
  FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
  FOREIGN KEY (GroupID) REFERENCES Groups(GroupTypeID)
);
