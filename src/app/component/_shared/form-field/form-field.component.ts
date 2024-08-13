import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss'
})
export class FormFieldComponent implements OnInit {
  @Input() label = '';
  @Input() info = '';
  @Input() infoShortForm = '';
  @Input() shortInfoNeeded: boolean = false;


  ngOnInit(): void {
    if (this.info && this.shortInfoNeeded && this.infoShortForm.length === 0) {
      this.infoShortForm = this.getAbbreviation(this.info);
    }
  }

  getAbbreviation(input: string): string {
    // Split the input string into an array of words
    const words = input.split(/\s+/); // Split by one or more whitespace characters
  
    // Map each word to its first letter and join the letters into a single string
    const abbreviation = words.map(word => word.charAt(0).toUpperCase()).join('');
  
    return abbreviation.toLowerCase();
  }
}
