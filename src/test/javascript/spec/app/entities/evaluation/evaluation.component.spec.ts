import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { ProjetticTestModule } from '../../../test.module';
import { EvaluationComponent } from 'app/entities/evaluation/evaluation.component';
import { EvaluationService } from 'app/entities/evaluation/evaluation.service';
import { Evaluation } from 'app/shared/model/evaluation.model';

describe('Component Tests', () => {
  describe('Evaluation Management Component', () => {
    let comp: EvaluationComponent;
    let fixture: ComponentFixture<EvaluationComponent>;
    let service: EvaluationService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ProjetticTestModule],
        declarations: [EvaluationComponent]
      })
        .overrideTemplate(EvaluationComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(EvaluationComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(EvaluationService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new Evaluation(123)],
            headers
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.evaluations && comp.evaluations[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
