import { Injectable } from '@angular/core';
import { Member } from '../models/members';
import { IMember, IMemberOption } from '../interfaces/member';
import { UtilService } from './util.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  membersLocalStorageKey = 'members'
  membersAreUpdatedLocalStorageKey = 'membersAreUpdated'
  isMembersUpdated = false;
  members = new BehaviorSubject<Member[]>([]);

  constructor(private utilService: UtilService) {
    this.loadSavedMembersFromLocalStorage();
    this.loadMembersSavedStateFromStorage();
    this.members.subscribe({
      next: members => {
        this.saveMembersToLocalStorage();
        this.saveMembersSavedStateToStorage();
      }
    });
  }

  loadMembersSavedStateFromStorage() {
    const isupdated = localStorage.getItem(this.membersAreUpdatedLocalStorageKey);
    this.isMembersUpdated = isupdated === 'true' ? true : false;
  }

  saveMembersSavedStateToStorage() {
    localStorage.setItem(this.membersAreUpdatedLocalStorageKey, this.isMembersUpdated.toString())
  }

  loadSavedMembersFromLocalStorage() {
    const savedMembers = localStorage.getItem(this.membersLocalStorageKey);
    if (savedMembers) {
      const members: IMember[] = JSON.parse(savedMembers);
      this.members.next(members.map(m => new Member(m)));
    }
  }

  saveMembersToLocalStorage() {
    const members = JSON.stringify(this.members.value);
    localStorage.setItem(this.membersLocalStorageKey, members);
  }

  addNewMember(member: IMember): void {
    member.memberId = this.utilService.generateNewId();
    if (member.options.length > 0) member.options = this.generateOptionIds(member.options);

    const members = this.members.value;
    members.push(new Member(member));
    this.isMembersUpdated = true;
    this.members.next(members);
  }

  removeMember(memberId: string): void {
    const filteredMembers = this.members.value.filter(member => member.memberId !== memberId);
    this.isMembersUpdated = true;
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
    this.isMembersUpdated = true;
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
    this.isMembersUpdated = true;
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
    this.isMembersUpdated = true;
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
    this.isMembersUpdated = true;
    this.members.next(members);
  }

  saveMembers() {
    this.isMembersUpdated = false;
    this.saveMembersSavedStateToStorage();
  }
}
