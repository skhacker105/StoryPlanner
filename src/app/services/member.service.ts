import { Injectable, OnDestroy } from '@angular/core';
import { Member } from '../models/members';
import { IMember, IMemberOption } from '../interfaces/member';
import { UtilService } from './util.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IVersion } from '../interfaces/version';
import { IMemberStorage } from '../interfaces/member-storage';
import { ServiceBase } from '../base/service-base';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends ServiceBase implements OnDestroy {

  membersLocalStorageKey = 'members';
  memberBookName = 'MyBook';
  version: IVersion = {
    primary: 0,
    major: 0,
    minor: 1,
  };
  members = new BehaviorSubject<Member[]>([]);

  memberStorageUpdated = new Subject<IMemberStorage>();

  constructor(private utilService: UtilService) {
    super();
    this.memberStorageUpdated
    .pipe(takeUntil(this.isServiceActive))
    .subscribe({
      next: memberStorage => this.saveMembersToLocalStorage(memberStorage)
    });
    this.loadSavedMembersFromLocalStorage();
    this.members
    .pipe(takeUntil(this.isServiceActive))
    .subscribe({
      next: members => this.fireMemberStorageUpdate()
    });
  }

  get versionNoString(): string {
    const defaultPad = (val: number) => val.toString().padStart(2, '0');
    return defaultPad(this.version.primary) + ':' + defaultPad(this.version.major) + ':' + defaultPad(this.version.minor);
  }

  set versionNoString(val: string) {
    const versionParts = val.toString().split(':');
    this.version.primary = +versionParts[0];
    this.version.major = +versionParts[1];
    this.version.minor = +versionParts[2];
  }

  ngOnDestroy(): void {
    this.onDestroy();
  }

  loadSavedMembersFromLocalStorage(): void {
    const savedMemberBook = localStorage.getItem(this.membersLocalStorageKey);
    if (savedMemberBook) {
      const storedMemberBook: IMemberStorage = JSON.parse(savedMemberBook);
      this.versionNoString = storedMemberBook.version;
      this.memberBookName = storedMemberBook.name;
      const members = storedMemberBook.members.map(m => new Member(m));
      this.members.next(members);
    }
  }

  saveMembersToLocalStorage(members: IMemberStorage): void {
    localStorage.setItem(this.membersLocalStorageKey, JSON.stringify(members));
  }  

  fireMemberStorageUpdate(): void {
    setTimeout(() => {
      this.memberStorageUpdated.next({
        members: this.members.value,
        name: this.memberBookName,
        version: this.versionNoString
      });
    }, 10);
  }

  updateBookName(name: string): void {
    this.memberBookName = name;
    this.fireMemberStorageUpdate();
  }

  updateVersionNumber(version: IVersion): void {
    this.version = version;
    this.fireMemberStorageUpdate();
  }

  addNewMember(member: IMember): void {
    member.memberId = this.utilService.generateNewId();
    if (member.options.length > 0) member.options = this.generateOptionIds(member.options);

    const members = this.members.value;
    members.push(new Member(member));
    this.members.next(members);
  }

  removeMember(memberId: string): void {
    const filteredMembers = this.members.value.filter(member => member.memberId !== memberId);
    this.members.next(filteredMembers);
  }

  updateMember(memberData: IMember): void {
    const members = this.members.value;
    let member = members.find(member => member.memberId === memberData.memberId);
    if (!member) {
      console.log('No member found to update for ', memberData);
      return;
    }

    if (memberData.options.length > 0) memberData.options = this.generateOptionIds(memberData.options);
    member.updateDetails(memberData);
    this.members.next(members);
  }

  generateOptionIds(options: IMemberOption[]): IMemberOption[] {
    return options.map(option => {
      if (!option.optionId) option.optionId = this.utilService.generateNewId();
      return option
    });
  }

  addMemberOption(memberId: string, option: IMemberOption): void {
    const members = this.members.value;
    const member = members.find(member => member.memberId === memberId);
    if (!member) {
      console.log('No member found to add option for ', memberId);
      return;
    }

    member.addOption(option);
    this.members.next(members);
  }

  updateMemberOption(memberId: string, option: IMemberOption): void {
    const members = this.members.value;
    const member = members.find(member => member.memberId === memberId);
    if (!member) {
      console.log('No member found to update option for ', memberId);
      return;
    }

    member.updateOption(option);
    this.members.next(members);
  }

  removeMemberOption(memberId: string, optionId: string): void {
    const members = this.members.value;
    const member = members.find(member => member.memberId === memberId);
    if (!member) {
      console.log('No member found to update option for ', memberId);
      return;
    }

    member.removeOption(optionId);
    this.members.next(members);
  }
}
