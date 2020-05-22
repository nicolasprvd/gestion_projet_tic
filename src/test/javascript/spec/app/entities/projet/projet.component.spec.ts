import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { ProjetticTestModule } from '../../../test.module';
import { ProjetComponent } from 'app/entities/projet/projet.component';
import { ProjetService } from 'app/entities/projet/projet.service';
import { Projet } from 'app/shared/model/projet.model';

describe('Component Tests', () => {
  describe('Projet Management Component', () => {
    let comp: ProjetComponent;
    let fixture: ComponentFixture<ProjetComponent>;
    let service: ProjetService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ProjetticTestModule],
        declarations: [ProjetComponent]
      })
        .overrideTemplate(ProjetComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(ProjetComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(ProjetService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new Projet(123)],
            headers
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.projects && comp.projects[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
